import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../index";
import { generateJWT } from "../utils/generateJWT";
import { createError, asyncHandler } from "../utils/handleErrors";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

const normalizeEmail = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Public registration always creates a regular user. Never accept a role from the client.
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2 || name.length > 100) {
      throw createError("Name must be between 2 and 100 characters", 400);
    }
    if (!isEmail(email)) {
      throw createError("Please provide a valid email address", 400);
    }
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      throw createError(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        400,
      );
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      throw createError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id, name, email, role",
      [name, email, hashedPassword],
    );
    const user = result.rows[0];

    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    if (!isEmail(email) || !password) {
      throw createError("Invalid credentials", 401);
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [email],
    );
    if (result.rows.length === 0) {
      throw createError("Invalid credentials", 401);
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError("Invalid credentials", 401);
    }
    if (user.role === "admin") {
      throw createError("Please use admin login for admin accounts", 403);
    }

    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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

// Admin login only accepts accounts that already have the admin role in the database.
export const adminLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    if (!isEmail(email) || !password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1 AND role = 'admin'",
      [email],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: "Admin login successful",
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
