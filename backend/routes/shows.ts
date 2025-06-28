import express from "express";
import {
  getShowsByMovie,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} from "../controllers/showController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/roleMiddleware";

const router = express.Router();

// Public routes
router.get("/movie/:movieId", getShowsByMovie);
router.get("/:id", getShowById);

// Admin routes
router.post("/", authenticateToken, requireAdmin, createShow);
router.put("/:id", authenticateToken, requireAdmin, updateShow);
router.delete("/:id", authenticateToken, requireAdmin, deleteShow);

export default router;
