import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { pool } from "../index";
import { createRazorpayOrder, verifyPayment } from "../utils/razorpayClient";
import { createError, asyncHandler } from "../utils/handleErrors";

const router = express.Router();

// Initialize payment (creates a Razorpay order only for the user's active seat holds)
router.post(
  "/initialize",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, selectedSeats, showId } = req.body;
    const userId = req.user?.userId;

    if (!userId) throw createError("User authentication required", 401);
    if (!showId || !Number.isInteger(Number(showId)) || Number(showId) < 1) {
      throw createError("A valid show ID is required", 400);
    }
    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length < 1 ||
      selectedSeats.length > 5 ||
      selectedSeats.some((seat: unknown) => typeof seat !== "string" || !/^[A-Z]\d{1,2}$/.test(seat)) ||
      new Set(selectedSeats).size !== selectedSeats.length
    ) {
      throw createError("Choose between one and five unique seats.", 400);
    }

    const expectedAmount = selectedSeats.length * 250;
    if (Number(amount) !== expectedAmount) {
      throw createError("The ticket total changed. Return to the seat map and try again.", 400);
    }

    const heldSeats = await pool.query(
      `SELECT seat_number
       FROM seats
       WHERE show_id = $1
         AND seat_number = ANY($2)
         AND locked_by = $3
         AND status = 'locked'
         AND lock_expires_at > NOW()`,
      [Number(showId), selectedSeats, userId]
    );
    if (heldSeats.rows.length !== selectedSeats.length) {
      throw createError("One or more seats are no longer held by you. Return to the seat map and choose again.", 400);
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (
      !razorpayKeyId ||
      razorpayKeyId === "rzp_test_your_test_key_id" ||
      !razorpayKeySecret ||
      razorpayKeySecret === "your_test_key_secret"
    ) {
      throw createError("Payment gateway is not configured. Please contact the site administrator.", 503);
    }

    try {
      const order = await createRazorpayOrder(
        expectedAmount,
        "INR",
        `mb_${userId}_${showId}_${Date.now()}`,
        {
          user_id: String(userId),
          show_id: String(showId),
          seat_numbers: [...selectedSeats].sort().join(","),
        },
      );
      res.status(200).json({
        orderId: order.id,
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      console.error("Failed to initialize payment order.");
      throw createError("Failed to initialize payment. Please try again.", 502);
    }
  }),
);

// Create Razorpay order
router.post(
  "/create-order",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount <= 0) {
      throw createError("Invalid amount", 400);
    }

    try {
      console.log("Creating order for amount:", amount);

      const order = await createRazorpayOrder(amount, currency);

      console.log("Order created successfully:", order.id);

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      throw createError("Failed to create payment order", 500);
    }
  }),
);

// Verify payment
router.post(
  "/verify",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      throw createError("Missing payment verification parameters", 400);
    }

    try {
      const isValid = await verifyPayment(paymentId, orderId, signature);

      if (isValid) {
        res.json({ verified: true, message: "Payment verified successfully" });
      } else {
        throw createError("Payment verification failed", 400);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      throw createError("Payment verification failed", 500);
    }
  }),
);

export default router;
