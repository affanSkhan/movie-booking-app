import express from 'express';
import { 
  getSeatsByShow, 
  selectSeat, 
  deselectSeat, 
  createSeatsForShow,
  cleanupExpiredLocks
} from '../controllers/seatController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = express.Router();

// Public routes
router.get('/show/:showId', getSeatsByShow);

// User routes (authenticated)
router.post('/select', authenticateToken, selectSeat);
router.post('/deselect', authenticateToken, deselectSeat);

// Admin routes
router.post('/create', authenticateToken, requireAdmin, createSeatsForShow);
router.post('/cleanup', authenticateToken, requireAdmin, cleanupExpiredLocks);

export default router; 