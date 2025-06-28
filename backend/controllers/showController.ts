import type { Request, Response, NextFunction } from 'express';
import { pool } from '../index';
import { createError, asyncHandler } from '../utils/handleErrors';

// Get shows for a movie
export const getShowsByMovie = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { movieId } = req.params;
  let result;
  if (movieId === 'all') {
    result = await pool.query('SELECT * FROM shows ORDER BY show_time');
  } else {
    result = await pool.query('SELECT * FROM shows WHERE movie_id = $1 ORDER BY show_time', [movieId]);
  }
  res.json(result.rows);
});

// Get show by ID
export const getShowById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const result = await pool.query(
    'SELECT s.*, m.title as movie_title FROM shows s JOIN movies m ON s.movie_id = m.id WHERE s.id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Show not found', 404);
  }

  res.json(result.rows[0]);
});

// Create new show (admin only)
export const createShow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { movie_id, show_time, screen } = req.body;

  // Validate input
  if (!movie_id || !show_time || !screen) {
    throw createError('Movie ID, show time, and screen are required', 400);
  }

  // Check if movie exists
  const movieCheck = await pool.query(
    'SELECT id FROM movies WHERE id = $1',
    [movie_id]
  );

  if (movieCheck.rows.length === 0) {
    throw createError('Movie not found', 404);
  }

  const result = await pool.query(
    'INSERT INTO shows (movie_id, show_time, screen) VALUES ($1, $2, $3) RETURNING *',
    [movie_id, show_time, screen]
  );

  res.status(201).json(result.rows[0]);
});

// Update show (admin only)
export const updateShow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { movie_id, show_time, screen } = req.body;

  // Validate input
  if (!movie_id || !show_time || !screen) {
    throw createError('Movie ID, show time, and screen are required', 400);
  }

  const result = await pool.query(
    'UPDATE shows SET movie_id = $1, show_time = $2, screen = $3 WHERE id = $4 RETURNING *',
    [movie_id, show_time, screen, id]
  );

  if (result.rows.length === 0) {
    throw createError('Show not found', 404);
  }

  res.json(result.rows[0]);
});

// Delete show (admin only)
export const deleteShow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check if show has any bookings
  const bookingCheck = await pool.query(
    'SELECT COUNT(*) FROM bookings WHERE show_id = $1',
    [id]
  );

  if (parseInt(bookingCheck.rows[0].count) > 0) {
    throw createError('Cannot delete show with existing bookings', 400);
  }

  const result = await pool.query(
    'DELETE FROM shows WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Show not found', 404);
  }

  res.json({ message: 'Show deleted successfully' });
}); 