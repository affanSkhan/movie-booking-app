import express from "express";
import { io, pool } from "../index";
import { verifyPayment } from "../utils/razorpayClient";
import { authenticateToken } from "../middlewares/authMiddleware";
import { seatLockingService } from "../services/seatLockingService";

const router = express.Router();

// Get user's bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT b.*, m.title as movie_title, s.show_time, s.screen 
       FROM bookings b 
       JOIN shows s ON b.show_id = s.id 
       JOIN movies m ON s.movie_id = m.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all bookings (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user!.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
              m.title as movie_title, s.show_time, s.screen 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN shows s ON b.show_id = s.id 
       JOIN movies m ON s.movie_id = m.id 
       ORDER BY b.created_at DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Confirm booking after payment. Payment signature, seat holds and booking writes
// are checked and committed together to prevent inconsistent seat states.
router.post("/confirm", authenticateToken, async (req, res) => {
  const userId = req.user!.userId;
  const { showId, seatNumbers, paymentId, orderId, signature } = req.body;

  if (!showId || !Number.isInteger(Number(showId)) || Number(showId) < 1) {
    res.status(400).json({ error: "A valid show ID is required." });
    return;
  }
  if (
    !Array.isArray(seatNumbers) ||
    seatNumbers.length < 1 ||
    seatNumbers.length > 5 ||
    seatNumbers.some((seat: unknown) => typeof seat !== "string" || !/^[A-Z]\d{1,2}$/.test(seat)) ||
    new Set(seatNumbers).size !== seatNumbers.length
  ) {
    res.status(400).json({ error: "Choose between one and five unique seats." });
    return;
  }
  if (!paymentId || !orderId || !signature) {
    res.status(400).json({ error: "Payment verification details are missing." });
    return;
  }

  try {
    const isPaymentValid = await verifyPayment(String(paymentId), String(orderId), String(signature));
    if (!isPaymentValid) {
      res.status(400).json({ error: "Payment verification failed." });
      return;
    }

    const client = await pool.connect();
    let booking: Record<string, unknown>;
    let bookedSeats: Array<{ id: number; seat_number: string }>;

    try {
      await client.query("BEGIN");

      const seatCheck = await client.query(
        \`SELECT id, seat_number
         FROM seats
         WHERE show_id = $1
           AND seat_number = ANY($2)
           AND locked_by = $3
           AND status = 'locked'
           AND lock_expires_at > NOW()
         FOR UPDATE\`,
        [Number(showId), seatNumbers, userId]
      );

      if (seatCheck.rows.length !== seatNumbers.length) {
        await client.query("ROLLBACK");
        res.status(409).json({ error: "One or more seats are no longer held by you. Refresh the seat map before trying again." });
        return;
      }

      const bookingResult = await client.query(
        \`INSERT INTO bookings (user_id, show_id, amount, payment_id, order_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *\`,
        [userId, Number(showId), seatNumbers.length * 250, paymentId, orderId, "confirmed"]
      );
      booking = bookingResult.rows[0];

      const seatUpdate = await client.query(
        \`UPDATE seats
         SET status = 'booked',
             locked_by = NULL,
             locked_at = NULL,
             lock_expires_at = NULL
         WHERE show_id = $1
           AND seat_number = ANY($2)
           AND locked_by = $3
           AND status = 'locked'
           AND lock_expires_at > NOW()
         RETURNING id, seat_number\`,
        [Number(showId), seatNumbers, userId]
      );

      if (seatUpdate.rows.length !== seatNumbers.length) {
        await client.query("ROLLBACK");
        res.status(409).json({ error: "Seat availability changed during confirmation. Keep your payment reference and contact support." });
        return;
      }
      bookedSeats = seatUpdate.rows;

      for (const seat of bookedSeats) {
        await client.query(
          "INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)",
          [booking.id, seat.id]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    for (const seat of bookedSeats) {
      io.to(\`show-\${showId}\`).emit("seat-updated", {
        seatNumber: seat.seat_number,
        status: "booked",
        userId: null,
      });
    }
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error confirming booking.");
    res.status(500).json({ error: "Booking confirmation could not be completed. Keep your payment reference and contact support if payment was captured." });
  }
});

// Handle failed payment - unlock seats
router.post("/payment-failed", authenticateToken, async (req, res) => {
  try {
    const { showId, seatNumbers } = req.body;
    const userId = req.user!.userId;

    console.log(
      `💳 Payment failed for user ${userId}, unlocking seats:`,
      seatNumbers,
    );

    // Unlock seats after failed payment
    await seatLockingService.unlockSeatsAfterFailedPayment(
      seatNumbers,
      showId,
      userId,
    );

    res.json({ message: "Seats unlocked after failed payment" });
  } catch (error) {
    console.error("Error handling failed payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel booking
router.post("/:bookingId/cancel", authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      ["cancelled", bookingId, userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Free up the seats
    const booking = result.rows[0];

    // Get seat numbers for this booking
    const seatNumbersResult = await pool.query(
      `SELECT s.seat_number 
       FROM booking_seats bs 
       JOIN seats s ON bs.seat_id = s.id 
       WHERE bs.booking_id = $1`,
      [bookingId],
    );

    const seatNumbers = seatNumbersResult.rows.map((row) => row.seat_number);

    // Update seats to available
    await pool.query(
      "UPDATE seats SET status = $1, locked_by = NULL, locked_at = NULL, lock_expires_at = NULL WHERE show_id = $2 AND seat_number = ANY($3)",
      ["available", booking.show_id, seatNumbers],
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
