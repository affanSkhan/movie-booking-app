import express from 'express';
import { 
  getAllMovies, 
  getMovieById, 
  createMovie, 
  updateMovie, 
  deleteMovie 
} from '../controllers/movieController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createMovie);
router.put('/:id', authenticateToken, requireAdmin, updateMovie);
router.delete('/:id', authenticateToken, requireAdmin, deleteMovie);

export default router; 