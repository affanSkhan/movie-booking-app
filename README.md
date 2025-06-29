# 🎬 Movie Booking System

A full-stack movie theater booking website with real-time seat selection, payment integration, and admin panel.

## 🌟 Features

- **Real-time Seat Selection**: WebSocket-powered live seat updates
- **Interactive Seat Map**: Visual seat selection with color coding
- **Payment Integration**: Razorpay payment gateway
- **Admin Panel**: Complete movie and show management
- **Responsive Design**: Mobile-first approach
- **User Authentication**: JWT-based authentication
- **Database Locking**: Prevents double booking conflicts

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates
- **Razorpay** for payments
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Razorpay** API integration

## 🚀 Live Demo

- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Railway/Render URL]
- **Admin Panel**: [Your Vercel URL]/admin

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Razorpay account (for payments)

## 🏗️ Local Development

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/movie-booking-system.git
cd movie-booking-system
```

### 2. Backend Setup
```bash
cd backend
bun install

# Create .env file
cp env.example .env
# Edit .env with your database and Razorpay credentials

# Start development server
bun run dev
```

### 3. Frontend Setup
```bash
cd frontend
bun install

# Create .env file
cp env.example .env
# Edit .env with your backend API URL

# Start development server
bun run dev
```

### 4. Database Setup
```sql
-- Run the database schema
psql -d your_database -f backend/enhanced_database.sql

-- Insert sample data
psql -d your_database -f backend/sample_data.sql
psql -d your_database -f backend/sample_booking_data.sql
```

## 🌐 Deployment

### Option 1: Railway (Backend) + Vercel (Frontend) - RECOMMENDED

#### Backend Deployment on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Connect your GitHub repository
   - Railway will auto-detect the backend configuration
   - Add PostgreSQL database from Railway dashboard

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   DB_USER=postgres
   DB_HOST=your-railway-postgres-host
   DB_NAME=railway
   DB_PASSWORD=your-railway-postgres-password
   DB_PORT=5432
   ```

#### Frontend Deployment on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Vercel will auto-detect Vite configuration

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app/api
   VITE_RAZORPAY_KEY=rzp_test_your_test_key_id
   ```

### Option 2: Render (Backend) + Netlify (Frontend)

#### Backend Deployment on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Create new Web Service
   - Connect GitHub repository
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run start`

3. **Add PostgreSQL Database**
   - Create PostgreSQL service
   - Link to your web service

#### Frontend Deployment on Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Connect GitHub repository
   - Build Command: `bun run build`
   - Publish Directory: `dist`

## 🔐 Admin Access

- **Email**: admin@moviebooking.com
- **Password**: admin123

## 📱 Features Demo

### User Features
1. **Browse Movies**: View all available movies
2. **Select Showtime**: Choose from available showtimes
3. **Interactive Seat Map**: Real-time seat selection
4. **Payment**: Secure payment via Razorpay
5. **Booking Confirmation**: Email confirmation and ticket

### Admin Features
1. **Dashboard**: Overview statistics
2. **Movie Management**: Add, edit, delete movies
3. **Show Management**: Add, edit, delete showtimes
4. **Booking Management**: View all bookings
5. **Real-time Updates**: Live booking statistics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)

### Shows
- `GET /api/shows/movie/all` - Get all shows
- `GET /api/shows/movie/:movieId` - Get shows by movie
- `POST /api/shows` - Create show (admin)
- `PUT /api/shows/:id` - Update show (admin)
- `DELETE /api/shows/:id` - Delete show (admin)

### Bookings
- `POST /api/bookings/create-order` - Create booking order
- `POST /api/bookings/confirm` - Confirm booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings` - Get all bookings (admin)

### Seats
- `GET /api/seats/show/:showId` - Get seats for show
- `POST /api/seats/select` - Select seat
- `POST /api/seats/deselect` - Deselect seat

### Payment
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## 🎯 Real-time Features

### WebSocket Events
- `seat-updated` - Real-time seat status updates
- `seat:lock:success` - Seat lock successful
- `seat:lock:error` - Seat lock failed
- `seat:unlock:success` - Seat unlock successful
- `seat:unlock:error` - Seat unlock failed

### Seat Status
- 🟢 **Available**: Seat can be selected
- 🟡 **Locked**: Seat is temporarily held
- 🔴 **Booked**: Seat is confirmed and paid

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting (recommended for production)

## 🚨 Important Notes

1. **Seat Locking**: Seats are locked for 3 minutes when selected
2. **Payment**: Uses Razorpay test mode by default
3. **Database**: PostgreSQL required for production
4. **Environment Variables**: Must be configured for deployment
5. **CORS**: Configured for localhost by default

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the deployment logs
- Review the environment variables

## 🎥 Demo Video

[Link to 5-minute demo video showing all features]

---

**Built with ❤️ for the Full Stack Developer Assessment** 