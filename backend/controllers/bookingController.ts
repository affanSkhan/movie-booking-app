import { type Request, type Response, type NextFunction } from 'express';
import { pool } from '../index';
import { createError, asyncHandler } from '../utils/handleErrors';
import { createRazorpayOrder, verifyPayment } from '../utils/razorpayClient';
import { io } from '../index';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// Get user's bookings
export const getUserBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw createError('User authentication required', 401);
  }

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
});

// Get all bookings (admin only)
export const getAllBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
});

// Create booking order (before payment)
export const createBookingOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { showId, seatNumbers } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw createError('User authentication required', 401);
  }

  if (!seatNumbers || seatNumbers.length === 0) {
    throw createError('At least one seat must be selected', 400);
  }

  // Calculate total amount (500 per seat)
  const totalAmount = seatNumbers.length * 500;

  // Create Razorpay order
  const order = await createRazorpayOrder(totalAmount);

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    showId,
    seatNumbers
  });
});

// Confirm booking after payment
export const confirmBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { showId, seatNumbers, paymentId, orderId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw createError('User authentication required', 401);
  }

  // Verify payment (in production, verify signature)
  const isPaymentValid = await verifyPayment(paymentId, orderId, 'signature');

  if (!isPaymentValid) {
    throw createError('Payment verification failed', 400);
  }

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if seats are still selected by this user
    const seatCheck = await client.query(
      'SELECT * FROM seats WHERE show_id = $1 AND seat_number = ANY($2) AND status = $3',
      [showId, seatNumbers, 'selected']
    );

    if (seatCheck.rows.length !== seatNumbers.length) {
      await client.query('ROLLBACK');
      throw createError('Some seats are no longer available', 400);
    }

    // Create booking
    const bookingResult = await client.query(
      'INSERT INTO bookings (user_id, show_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, showId, seatNumbers.length * 500, 'confirmed']
    );

    const booking = bookingResult.rows[0];

    // Create booking-seat relationships
    for (const seatNumber of seatNumbers) {
      const seatResult = await client.query(
        'SELECT id FROM seats WHERE show_id = $1 AND seat_number = $2',
        [showId, seatNumber]
      );

      if (seatResult.rows.length > 0) {
        await client.query(
          'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
          [booking.id, seatResult.rows[0].id]
        );
      }
    }

    // Mark seats as booked
    await client.query(
      'UPDATE seats SET status = $1, locked_at = NULL WHERE show_id = $2 AND seat_number = ANY($3)',
      ['booked', showId, seatNumbers]
    );

    await client.query('COMMIT');

    // Broadcast seat updates
    for (const seatNumber of seatNumbers) {
      io.to(`show-${showId}`).emit('seat-updated', {
        seatNumber,
        status: 'booked',
        userId: null
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { bookingId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw createError('User authentication required', 401);
  }

  const result = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    ['cancelled', bookingId, userId]
  );

  if (result.rows.length === 0) {
    throw createError('Booking not found', 404);
  }

  const booking = result.rows[0];

  // Free up the seats
  const seatResult = await pool.query(
    `SELECT s.seat_number, s.show_id 
     FROM seats s 
     JOIN booking_seats bs ON s.id = bs.seat_id 
     WHERE bs.booking_id = $1`,
    [bookingId]
  );

  for (const seat of seatResult.rows) {
    await pool.query(
      'UPDATE seats SET status = $1, locked_at = NULL WHERE show_id = $2 AND seat_number = $3',
      ['available', seat.show_id, seat.seat_number]
    );

    // Broadcast seat update
    io.to(`show-${seat.show_id}`).emit('seat-updated', {
      seatNumber: seat.seat_number,
      status: 'available',
      userId: null
    });
  }

  res.json({ message: 'Booking cancelled successfully' });
}); 