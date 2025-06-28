import express from 'express';
import { pool } from '../index';
import { authenticateToken } from '../middlewares/authMiddleware';
import { seatLockingService } from '../services/seatLockingService';

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT b.*, m.title as movie_title, s.show_time, s.screen 
       FROM bookings b 
       JOIN shows s ON b.show_id = s.id 
       JOIN movies m ON s.movie_id = m.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
              m.title as movie_title, s.show_time, s.screen 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN shows s ON b.show_id = s.id 
       JOIN movies m ON s.movie_id = m.id 
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm booking after payment
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { showId, seatNumbers, paymentId, orderId } = req.body;
    const userId = req.user!.userId;

    console.log(`🎫 Confirming booking for user ${userId}:`, { showId, seatNumbers, paymentId, orderId });

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if seats are still locked by this user
      const seatCheck = await client.query(
        'SELECT * FROM seats WHERE show_id = $1 AND seat_number = ANY($2) AND locked_by = $3 AND status = $4',
        [showId, seatNumbers, userId, 'locked']
      );

      if (seatCheck.rows.length !== seatNumbers.length) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Some seats are no longer available' });
        return;
      }

      // Create booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, show_id, amount, payment_id, order_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, showId, seatNumbers.length * 500, paymentId, orderId, 'confirmed']
      );

      // Mark seats as booked using the seat locking service
      const bookResult = await seatLockingService.bookSeats(seatNumbers, showId, userId);
      
      if (!bookResult.success) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: bookResult.message });
        return;
      }

      // Create booking_seats entries
      for (const seatNumber of seatNumbers) {
        const seatResult = await client.query(
          'SELECT id FROM seats WHERE show_id = $1 AND seat_number = $2',
          [showId, seatNumber]
        );
        
        if (seatResult.rows.length > 0) {
          await client.query(
            'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
            [bookingResult.rows[0].id, seatResult.rows[0].id]
          );
        }
      }

      await client.query('COMMIT');

      console.log(`✅ Booking confirmed successfully for user ${userId}`);

      res.status(201).json(bookingResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle failed payment - unlock seats
router.post('/payment-failed', authenticateToken, async (req, res) => {
  try {
    const { showId, seatNumbers } = req.body;
    const userId = req.user!.userId;

    console.log(`💳 Payment failed for user ${userId}, unlocking seats:`, seatNumbers);

    // Unlock seats after failed payment
    await seatLockingService.unlockSeatsAfterFailedPayment(seatNumbers, showId, userId);

    res.json({ message: 'Seats unlocked after failed payment' });
  } catch (error) {
    console.error('Error handling failed payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.post('/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      ['cancelled', bookingId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Free up the seats
    const booking = result.rows[0];
    
    // Get seat numbers for this booking
    const seatNumbersResult = await pool.query(
      `SELECT s.seat_number 
       FROM booking_seats bs 
       JOIN seats s ON bs.seat_id = s.id 
       WHERE bs.booking_id = $1`,
      [bookingId]
    );

    const seatNumbers = seatNumbersResult.rows.map(row => row.seat_number);

    // Update seats to available
    await pool.query(
      'UPDATE seats SET status = $1, locked_by = NULL, locked_at = NULL, lock_expires_at = NULL WHERE show_id = $2 AND seat_number = ANY($3)',
      ['available', booking.show_id, seatNumbers]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 