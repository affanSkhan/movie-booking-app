import { type Request, type Response, type NextFunction } from 'express';
import { pool } from '../index';
import { createError, asyncHandler } from '../utils/handleErrors';

// Get admin dashboard stats
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get total movies
  const moviesCount = await pool.query('SELECT COUNT(*) FROM movies');
  
  // Get total shows
  const showsCount = await pool.query('SELECT COUNT(*) FROM shows');
  
  // Get total bookings
  const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
  
  // Get total users
  const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
  
  // Get recent bookings
  const recentBookings = await pool.query(
    `SELECT b.*, u.name as user_name, m.title as movie_title 
     FROM bookings b 
     JOIN users u ON b.user_id = u.id 
     JOIN shows s ON b.show_id = s.id 
     JOIN movies m ON s.movie_id = m.id 
     ORDER BY b.created_at DESC 
     LIMIT 10`
  );

  res.json({
    stats: {
      totalMovies: parseInt(moviesCount.rows[0].count),
      totalShows: parseInt(showsCount.rows[0].count),
      totalBookings: parseInt(bookingsCount.rows[0].count),
      totalUsers: parseInt(usersCount.rows[0].count)
    },
    recentBookings: recentBookings.rows
  });
});

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );

  res.json(result.rows);
});

// Update user role (admin only)
export const updateUserRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw createError('Invalid role. Must be "user" or "admin"', 400);
  }

  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
    [role, userId]
  );

  if (result.rows.length === 0) {
    throw createError('User not found', 404);
  }

  res.json(result.rows[0]);
});

// Delete user (admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  // Check if user has bookings
  const bookingCheck = await pool.query(
    'SELECT COUNT(*) FROM bookings WHERE user_id = $1',
    [userId]
  );

  if (parseInt(bookingCheck.rows[0].count) > 0) {
    throw createError('Cannot delete user with existing bookings', 400);
  }

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [userId]
  );

  if (result.rows.length === 0) {
    throw createError('User not found', 404);
  }

  res.json({ message: 'User deleted successfully' });
}); 