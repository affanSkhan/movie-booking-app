import express from "express";
import { register, login, adminLogin, getProfile } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Admin login
router.post("/admin-login", adminLogin);

// Get current user profile
router.get("/profile", authenticateToken, getProfile);

export default router;
