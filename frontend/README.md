# Movie Booking System - Frontend

A modern React-based frontend for the Movie Booking System with real-time seat selection and payment integration.

## 🚀 Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Real-time Seat Selection**: Socket.IO integration for live seat updates
- **Payment Integration**: Razorpay payment gateway
- **Responsive Design**: Mobile-first approach
- **Authentication**: JWT-based user authentication
- **Admin Panel**: Complete admin interface for managing movies, shows, and bookings

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── MovieCard.tsx   # Movie display card
│   ├── SeatMap.tsx     # Interactive seat selection
│   └── PaymentForm.tsx # Payment form with Razorpay
├── pages/              # Page components
│   ├── Home.tsx        # Movie listing page
│   ├── MovieDetails.tsx # Movie details with showtimes
│   ├── ShowBooking.tsx # Seat selection and booking
│   ├── BookingSuccess.tsx # Booking confirmation
│   ├── AdminLogin.tsx  # Admin login page
│   └── AdminPanel.tsx  # Admin dashboard
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state management
│   └── SocketContext.tsx # Socket.IO connection management
├── services/           # API services
│   └── api.ts         # HTTP client and API endpoints
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.tsx            # Main app component with routing
└── main.tsx           # App entry point
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Razorpay** - Payment gateway

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-booking-system/frontend
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   ```

4. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📱 Pages & Features

### Public Pages

#### 🏠 Home (`/`)
- Displays all available movies
- Responsive grid layout
- Movie cards with posters and details

#### 🎬 Movie Details (`/movie/:id`)
- Movie information and description
- Available showtimes
- Navigation to seat selection

### Protected Pages

#### 🪑 Show Booking (`/booking/:showId`)
- Interactive seat map (10x10 grid)
- Real-time seat status updates
- Seat selection with visual feedback
- Payment integration with Razorpay
- Booking confirmation

#### ✅ Booking Success (`/booking-success`)
- Booking confirmation details
- Payment status
- Important information for customers

### Admin Pages

#### 🔐 Admin Login (`/admin/login`)
- Admin authentication
- Role-based access control

#### 👨‍💼 Admin Panel (`/admin`)
- **Dashboard**: Overview statistics
- **Movies**: Add and manage movies
- **Shows**: Add and manage showtimes
- **Bookings**: View all bookings

## 🔌 Real-time Features

### Socket.IO Integration

The frontend connects to the backend via Socket.IO for real-time seat management:

- **Seat Selection**: Users can select/deselect seats in real-time
- **Live Updates**: Other users see seat status changes immediately
- **Auto-unlock**: Seats are automatically unlocked after 3 minutes if not paid
- **Connection Status**: Visual indicator of Socket.IO connection status

### Seat Map Features

- **Color-coded Seats**:
  - 🟢 Green: Available
  - 🟡 Yellow: Selected (by current user)
  - 🔴 Red: Booked/Locked
- **Interactive Grid**: Click to select/deselect seats
- **Row/Column Labels**: Clear seat identification
- **Screen Display**: Visual representation of theater layout

## 💳 Payment Integration

### Razorpay Integration

- **Test Mode**: Uses Razorpay test keys
- **Secure Payment**: Redirects to Razorpay for payment processing
- **Payment Confirmation**: Automatic booking confirmation on successful payment
- **Error Handling**: Graceful handling of payment failures

### Payment Flow

1. User selects seats
2. Fills customer details (name, email)
3. Clicks "Pay" button
4. Razorpay modal opens
5. User completes payment
6. Booking is confirmed automatically
7. Redirected to success page

## 🔐 Authentication

### JWT-based Authentication

- **Token Storage**: JWT tokens stored in localStorage
- **Auto-refresh**: Automatic token validation on app load
- **Protected Routes**: Role-based access control
- **Auto-logout**: Automatic logout on token expiration

### User Roles

- **User**: Can browse movies, book seats, view bookings
- **Admin**: Full access to admin panel, can manage movies/shows/bookings

## 🎨 UI/UX Features

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop**: Full-featured desktop experience

### Modern Design

- **Clean Interface**: Minimalist, modern design
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Build for Production

```bash
bun run build
# or
npm run build
```

### Environment Variables for Production

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

### Deployment Platforms

- **Vercel**: Recommended for React apps
- **Netlify**: Alternative deployment option
- **GitHub Pages**: Free hosting option

## 🔧 Development

### Available Scripts

```bash
# Development
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun lint         # Run ESLint
bun type-check   # Run TypeScript type checking
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **React Best Practices**: Functional components, hooks

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
- Check the backend README for API documentation
- Review the code comments for implementation details 