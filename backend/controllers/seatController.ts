import type { Request, Response, NextFunction } from "express";
import { pool } from "../index";
import { createError, asyncHandler } from "../utils/handleErrors";
import { io } from "../index";
import { seatLockingService } from "../services/seatLockingService";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// Get seats for a show
export const getSeatsByShow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { showId } = req.params;

    let result = await pool.query(
      `SELECT s.*, 
            CASE 
              WHEN s.status = 'locked' AND s.lock_expires_at < NOW() THEN 'available'
              ELSE s.status 
            END as current_status,
            s.locked_by,
            s.lock_expires_at
     FROM seats s 
     WHERE s.show_id = $1 
     ORDER BY s.row_number, s.col_number`,
      [showId],
    );

    // If no seats exist, create them automatically (10x10 grid)
    if (result.rows.length === 0) {
      console.log(
        `No seats found for show ${showId}, creating default 10x10 grid`,
      );

      // Check if show exists
      const showCheck = await pool.query("SELECT id FROM shows WHERE id = $1", [
        showId,
      ]);

      if (showCheck.rows.length === 0) {
        throw createError("Show not found", 404);
      }

      // Create 10x10 grid (A1 to J10)
      const seatRows = Array.from({ length: 10 }, (_, i) =>
        String.fromCharCode(65 + i),
      ); // A, B, C, ..., J
      const seatColumns = Array.from({ length: 10 }, (_, i) => i + 1);

      for (const row of seatRows) {
        for (const col of seatColumns) {
          const seatNumber = `${row}${col}`;
          await pool.query(
            "INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES ($1, $2, $3, $4, $5)",
            [showId, seatNumber, seatRows.indexOf(row) + 1, col, "available"],
          );
        }
      }

      // Fetch the newly created seats
      result = await pool.query(
        `SELECT s.*, 
              CASE 
                WHEN s.status = 'locked' AND s.lock_expires_at < NOW() THEN 'available'
                ELSE s.status 
              END as current_status,
              s.locked_by,
              s.lock_expires_at
       FROM seats s 
       WHERE s.show_id = $1 
       ORDER BY s.row_number, s.col_number`,
        [showId],
      );
    }

    // Clean up any expired locks before returning
    await pool.query(
      `UPDATE seats 
     SET status = 'available', 
         locked_by = NULL, 
         locked_at = NULL, 
         lock_expires_at = NULL 
     WHERE status = 'locked' AND lock_expires_at < NOW()`,
    );

    res.json(result.rows);
  },
);

// Select a seat (lock it)
export const selectSeat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { showId, seatNumber } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw createError("User authentication required", 401);
    }

    // Check if seat exists and is available
    const seatCheck = await pool.query(
      "SELECT * FROM seats WHERE show_id = $1 AND seat_number = $2",
      [showId, seatNumber],
    );

    if (seatCheck.rows.length === 0) {
      throw createError("Seat not found", 404);
    }

    const seat = seatCheck.rows[0];

    if (seat.status !== "available") {
      throw createError("Seat is not available", 400);
    }

    // Lock the seat using the seat locking service
    const lockResult = await seatLockingService.lockSeat({
      seatId: seat.id,
      seatNumber,
      showId,
      userId,
      socketId: "api", // API calls don't have socket ID
    });

    if (!lockResult.success) {
      throw createError(lockResult.message, 400);
    }

    res.json(lockResult.seat);
  },
);

// Deselect a seat (unlock it)
export const deselectSeat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { showId, seatNumber } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw createError("User authentication required", 401);
    }

    // Unlock the seat using the seat locking service
    const unlockResult = await seatLockingService.unlockSeat(
      seatNumber,
      showId,
      userId,
      "api", // API calls don't have socket ID
    );

    if (!unlockResult.success) {
      throw createError(unlockResult.message, 400);
    }

    res.json({ message: "Seat unlocked successfully" });
  },
);

// Create seats for a show (admin only)
export const createSeatsForShow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { showId, rows = 10, columns = 10 } = req.body;

    // Check if show exists
    const showCheck = await pool.query("SELECT id FROM shows WHERE id = $1", [
      showId,
    ]);

    if (showCheck.rows.length === 0) {
      throw createError("Show not found", 404);
    }

    // Check if seats already exist
    const existingSeats = await pool.query(
      "SELECT COUNT(*) FROM seats WHERE show_id = $1",
      [showId],
    );

    if (parseInt(existingSeats.rows[0].count) > 0) {
      throw createError("Seats already exist for this show", 400);
    }

    // Create seats (A1 to J10 or custom)
    const seatRows = Array.from({ length: rows }, (_, i) =>
      String.fromCharCode(65 + i),
    ); // A, B, C, ...
    const seatColumns = Array.from({ length: columns }, (_, i) => i + 1);

    const seats = [];
    for (const row of seatRows) {
      for (const col of seatColumns) {
        const seatNumber = `${row}${col}`;
        seats.push([showId, seatNumber, seatRows.indexOf(row) + 1, col]);
      }
    }

    // Insert all seats
    for (const [showId, seatNumber, rowNumber, colNumber] of seats) {
      await pool.query(
        "INSERT INTO seats (show_id, seat_number, row_number, col_number) VALUES ($1, $2, $3, $4)",
        [showId, seatNumber, rowNumber, colNumber],
      );
    }

    res.status(201).json({
      message: "Seats created successfully",
      count: seats.length,
    });
  },
);

// Clean up expired seat locks (utility function)
export const cleanupExpiredLocks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const result = await pool.query(
      "UPDATE seats SET status = $1, locked_at = NULL WHERE status = $2 AND locked_at < $3 RETURNING *",
      ["available", "selected", threeMinutesAgo],
    );

    // Broadcast updates for each affected show
    const affectedShows = new Set();
    for (const seat of result.rows) {
      affectedShows.add(seat.show_id);
      io.to(`show-${seat.show_id}`).emit("seat-updated", {
        seatNumber: seat.seat_number,
        status: "available",
        userId: null,
      });
    }

    res.json({
      message: "Expired locks cleaned up",
      unlockedSeats: result.rows.length,
      affectedShows: Array.from(affectedShows),
    });
  },
);
