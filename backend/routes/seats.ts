import express from "express";
import {
  getSeatsByShow,
  selectSeat,
  deselectSeat,
  createSeatsForShow,
  cleanupExpiredLocks,
} from "../controllers/seatController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/roleMiddleware";
import { seatLockingService } from "../services/seatLockingService";

const router = express.Router();

// Public routes
router.get("/show/:showId", getSeatsByShow);

// User routes (authenticated)
router.post("/select", authenticateToken, selectSeat);
router.post("/deselect", authenticateToken, deselectSeat);

// Extend lock duration for selected seats (e.g., for payment)
router.post('/extend-lock', authenticateToken, async (req, res) => {
  try {
    const { showId, seatNumbers, durationMinutes } = req.body;
    const userId = (req.user as { userId: number }).userId;
    if (
      !showId ||
      !Number.isInteger(Number(showId)) ||
      !Array.isArray(seatNumbers) ||
      seatNumbers.length < 1 ||
      seatNumbers.length > 5 ||
      seatNumbers.some((seat: unknown) => typeof seat !== 'string' || !/^[A-Z]\d{1,2}$/.test(seat)) ||
      new Set(seatNumbers).size !== seatNumbers.length
    ) {
      res.status(400).json({ error: 'Choose between one and five unique seats for a valid show.' });
      return;
    }
    const requestedDuration = Number(durationMinutes ?? 10);
    if (!Number.isInteger(requestedDuration) || requestedDuration < 1 || requestedDuration > 10) {
      res.status(400).json({ error: 'Seat hold duration must be between 1 and 10 minutes.' });
      return;
    }
    const durationMs = requestedDuration * 60 * 1000;
    const result = await seatLockingService.extendLockDurationForSeats(
      seatNumbers,
      showId,
      userId,
      durationMs
    );
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({ message: 'Lock duration extended.' });
  } catch (error) {
    console.error('Error in /seats/extend-lock:', error);
    res.status(500).json({ error: 'Failed to extend lock duration.' });
  }
});

// Admin routes
router.post("/create", authenticateToken, requireAdmin, createSeatsForShow);
router.post("/cleanup", authenticateToken, requireAdmin, cleanupExpiredLocks);

export default router;
