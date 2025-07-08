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
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      res.status(400).json({ error: 'showId and seatNumbers are required.' });
      return;
    }
    const durationMs = (durationMinutes || 10) * 60 * 1000; // default to 10 minutes
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
