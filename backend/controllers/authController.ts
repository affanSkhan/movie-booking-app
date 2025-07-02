import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../index";
import { createError, asyncHandler } from "../utils/handleErrors";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// User registration
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role = "user" } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw createError("User already exists", 400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role],
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  },
);

// User login
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      throw createError("Invalid credentials", 401);
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw createError("Invalid credentials", 401);
    }

    // Only allow non-admin users to login through regular login
    if (user.role === "admin") {
      throw createError("Please use admin login for admin accounts", 403);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  },
);

// Admin login
export const adminLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    console.log(`[ADMIN LOGIN] Attempt for email: ${email}`);

    // Check for admin in database
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email]);
    if (result.rows.length === 0) {
      console.warn(`[ADMIN LOGIN] No admin found in database for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.warn(`[ADMIN LOGIN] Invalid password for admin email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Generate JWT token for database admin
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );
    console.log(`[ADMIN LOGIN] Success for database admin: ${user.email}`);
    res.status(200).json({
      message: "Admin login successful (database)",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  },
);

// Get current user profile
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      throw createError("User not found", 404);
    }

    res.json(result.rows[0]);
  },
);
