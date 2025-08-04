import { type Request, type Response, type NextFunction } from "express";
import { pool } from "../index";
import { createError, asyncHandler } from "../utils/handleErrors";

// Get all movies
export const getAllMovies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Attempting to fetch movies from database...');
      const result = await pool.query(
        "SELECT * FROM movies ORDER BY created_at DESC",
      );
      console.log(`Successfully fetched ${result.rows.length} movies`);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error in getAllMovies:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }
  },
);

// Get movie by ID
export const getMovieById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      throw createError("Movie not found", 404);
    }

    res.json(result.rows[0]);
  },
);

// Create new movie (admin only)
export const createMovie = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, poster_url, duration } = req.body;

    // Validate input
    if (!title) {
      throw createError("Title is required", 400);
    }

    const result = await pool.query(
      "INSERT INTO movies (title, description, poster_url, duration) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, poster_url, duration],
    );

    res.status(201).json(result.rows[0]);
  },
);

// Update movie (admin only)
export const updateMovie = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, description, poster_url, duration } = req.body;

    // Validate input
    if (!title) {
      throw createError("Title is required", 400);
    }

    const result = await pool.query(
      "UPDATE movies SET title = $1, description = $2, poster_url = $3, duration = $4 WHERE id = $5 RETURNING *",
      [title, description, poster_url, duration, id],
    );

    if (result.rows.length === 0) {
      throw createError("Movie not found", 404);
    }

    res.json(result.rows[0]);
  },
);

// Delete movie (admin only)
export const deleteMovie = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM movies WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      throw createError("Movie not found", 404);
    }

    res.json({ message: "Movie deleted successfully" });
  },
);
