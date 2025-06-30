# Movie Booking System - Backend API

A comprehensive backend API for a movie booking system with real-time seat management, user authentication, payment integration, and a modern admin panel. Built with Bun, Express, TypeScript, and PostgreSQL.

## Features

- **User Authentication**: JWT-based, role-based access
- **Movie Management**: CRUD for movies (admin only)
- **Show Management**: Create/manage shows with showtimes
- **Real-time Seat Booking**: Socket.IO for live seat updates
- **Payment Integration**: Razorpay for ticket payments
- **Admin Panel**: Dashboard analytics, user management
- **Database**: PostgreSQL with relationships and constraints
- **Security**: Input validation, password hashing, CORS, SQL injection prevention

## Tech Stack

- **Runtime**: Bun (recommended, Node.js alternative)
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
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

## API Endpoints (Sample)

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `POST /api/auth/admin-login` - Admin login

### Movies

- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create new movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)

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

- `users` - User accounts
- `movies` - Movie info
- `shows` - Showtimes
- `seats` - Seat status
- `bookings` - Booking records
- `booking_seats` - Booked seats

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
   FRONTEND_URL=https://movie-booking-frontend.netlify.app
   RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

4. **Run Development Server**
   ```bash
   bun run dev
   ```

## Deployment

- **Backend deployed on Render**: https://movie-booking-backend.onrender.com
- **Frontend deployed on Netlify**: https://movie-booking-frontend.netlify.app

## Real-time Features

- **Seat Locking**: Seats are locked for 3 minutes when selected
- **Auto-unlock**: Seats auto-unlock if not confirmed
- **Live Updates**: All users see seat status changes instantly
- **Race Condition Prevention**: DB-level locking prevents double bookings

## Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access
- Input validation (zod)
- SQL injection prevention
- CORS configuration

## Payment Integration

- Razorpay test mode
- Order creation, payment verification, booking confirmation

## Error Handling

- Centralized error middleware
- Consistent error responses
- Proper HTTP status codes
- Error logging

## Development

- TypeScript for type safety
- Modular architecture
- Async/await for clean code
- Clean code practices

## Related

- See the root `README.md` and `frontend/README.md` for full-stack setup, UI/UX, and deployment.
- For admin panel and analytics, see frontend documentation.

## License

MIT
