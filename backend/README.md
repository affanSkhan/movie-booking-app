# Movie Booking System - Backend API

A comprehensive backend API for a movie booking system with real-time seat management, user authentication, and admin panel functionality.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Movie Management**: CRUD operations for movies (admin only)
- **Show Management**: Create and manage movie shows with showtimes
- **Real-time Seat Booking**: Socket.IO integration for live seat updates
- **Payment Integration**: Razorpay integration for ticket payments
- **Admin Panel**: Dashboard with analytics and user management
- **Database**: PostgreSQL with proper relationships and constraints

## Tech Stack

- **Runtime**: Bun (Node.js alternative)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT with bcrypt
- **Payment**: Razorpay (test mode)

## Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── authController.ts
│   ├── movieController.ts
│   ├── showController.ts
│   ├── seatController.ts
│   ├── bookingController.ts
│   └── adminController.ts
├── routes/              # API routes
│   ├── auth.ts
│   ├── movies.ts
│   ├── shows.ts
│   ├── seats.ts
│   ├── bookings.ts
│   └── admin.ts
├── middlewares/         # Custom middlewares
│   ├── authMiddleware.ts
│   └── roleMiddleware.ts
├── utils/              # Utility functions
│   ├── generateJWT.ts
│   ├── handleErrors.ts
│   └── razorpayClient.ts
├── database.sql        # Database schema
├── index.ts           # Main server file
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Movies (Public)

- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID

### Movies (Admin)

- `POST /api/movies` - Create new movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

### Shows

- `GET /api/shows/movie/:movieId` - Get shows for a movie
- `GET /api/shows/:id` - Get show by ID
- `POST /api/shows` - Create new show (admin)
- `PUT /api/shows/:id` - Update show (admin)
- `DELETE /api/shows/:id` - Delete show (admin)

### Seats

- `GET /api/seats/show/:showId` - Get seats for a show
- `POST /api/seats/select` - Select a seat (authenticated)
- `POST /api/seats/deselect` - Deselect a seat (authenticated)
- `POST /api/seats/create` - Create seats for show (admin)
- `POST /api/seats/cleanup` - Clean up expired locks (admin)

### Bookings

- `GET /api/bookings/my-bookings` - Get user's bookings (authenticated)
- `POST /api/bookings/create-order` - Create booking order (authenticated)
- `POST /api/bookings/confirm` - Confirm booking after payment (authenticated)
- `POST /api/bookings/:bookingId/cancel` - Cancel booking (authenticated)
- `GET /api/bookings` - Get all bookings (admin)

### Admin

- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user

## Socket.IO Events

### Client to Server

- `join-show` - Join a show room
- `leave-show` - Leave a show room
- `select-seat` - Select a seat
- `deselect-seat` - Deselect a seat

### Server to Client

- `seat-updated` - Seat status updated
- `error` - Error message

## Database Schema

The system uses PostgreSQL with the following main tables:

- `users` - User accounts and authentication
- `movies` - Movie information
- `shows` - Movie showtimes
- `seats` - Seat availability and status
- `bookings` - Booking records
- `booking_seats` - Many-to-many relationship between bookings and seats

## Setup Instructions

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Database Setup**
   - Create a PostgreSQL database
   - Run the schema: `psql -d your_db_name -f database.sql`

3. **Environment Variables**
   Create a `.env` file with:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/movie_booking_db
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

4. **Run Development Server**
   ```bash
   bun run dev
   ```

## Real-time Features

- **Seat Locking**: When a user selects a seat, it's locked for 3 minutes
- **Auto-unlock**: Seats are automatically unlocked if not confirmed within 3 minutes
- **Live Updates**: All connected users see seat status changes in real-time
- **Race Condition Prevention**: Database-level locking prevents double bookings

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS configuration

## Payment Integration

- Razorpay test mode integration
- Order creation before payment
- Payment verification
- Booking confirmation after successful payment

## Error Handling

- Centralized error handling middleware
- Consistent error response format
- Proper HTTP status codes
- Detailed error logging

## Development

- TypeScript for type safety
- Modular architecture with controllers and routes
- Async/await for clean asynchronous code
- Comprehensive error handling
- Clean code practices with proper separation of concerns
