import express from "express";
import { register, login, adminLogin } from "../controllers/authController";

const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Admin login
router.post("/admin-login", adminLogin);

export default router;
