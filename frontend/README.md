# Movie Booking System - Frontend

A modern React-based frontend for the Movie Booking System with real-time seat selection, payment integration, dark mode, and a beautiful, accessible admin panel.

## 🚀 Features

- **Modern UI/UX**: Glassmorphism, gradients, custom buttons/inputs, smooth transitions (Framer Motion)
- **Dark Mode**: Toggleable, system-aware, accessible (Tailwind + CSS variables)
- **Real-time Seat Selection**: Socket.IO for live seat updates
- **Payment Integration**: Razorpay payment gateway
- **Responsive Design**: Mobile-first, tablet, and desktop support
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators, color contrast
- **Authentication**: JWT-based user authentication
- **Admin Panel**: Sidebar-based dashboard, stats, charts (Recharts), real-time analytics

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── MovieCard.tsx   # Movie display card
│   ├── SeatMap.tsx     # Interactive seat selection
│   ├── PaymentForm.tsx # Payment form with Razorpay
│   └── admin/          # Admin panel components
├── pages/              # Page components
│   ├── Home.tsx        # Movie listing
│   ├── MovieDetails.tsx # Movie details
│   ├── ShowBooking.tsx # Seat selection/booking
│   ├── BookingSuccess.tsx # Booking confirmation
│   ├── AdminLogin.tsx  # Admin login
│   └── AdminPanel.tsx  # Admin dashboard
├── contexts/           # React contexts
├── services/           # API services
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── App.tsx             # Main app
└── main.tsx            # Entry point
```

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite**
- **Tailwind CSS** (with CSS variable-based color theming, see `tailwind.config.js`)
- **Framer Motion** (animations)
- **Recharts** (admin analytics)
- **Socket.IO Client**
- **Razorpay** (payments)
- **React Router**
- **Axios**
- **Zod** (validation)

## 🧑‍💻 Getting Started

### Prerequisites

- Bun (recommended) or Node.js 18+
- Backend server running (see backend/README.md)

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
   Create a `.env` file:
   ```env
   VITE_API_URL=https://movie-booking-backend.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   ```

4. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎨 UI/UX & Accessibility

- **Design Tokens**: Tailwind config uses CSS variables for color theming (see `tailwind.config.js`)
- **Dark Mode**: Toggle or system preference (`darkMode: 'class'` in Tailwind)
- **Glassmorphism & Gradients**: Modern, soft backgrounds
- **Custom Buttons & Inputs**: Consistent, accessible, animated
- **Transitions**: Framer Motion for page/component transitions
- **Accessibility**: ARIA labels, keyboard navigation, focus rings, color contrast

## 📊 Admin Panel

- **Sidebar Navigation**: Accessible, keyboard-friendly
- **Dashboard**: Stats cards, charts (Recharts), real-time analytics (polling/WebSocket-ready)
- **Modular Components**: Sidebar, StatsCards, DashboardCharts
- **Live Updates**: Booking stats auto-refresh
- **Animations**: Framer Motion for smooth transitions

## 🔒 Security

- JWT authentication
- Password hashing (backend)
- Role-based access
- Input validation (zod)
- CORS configuration

## 🔗 Pages & Features

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

## 🛂 Admin Access (Demo)

- **Email**: admin@moviebooking.com
- **Password**: admin123

## 🧪 QA & Testing

- Linting: `bun run lint`
- Prettier: `bun run format` (if configured)
- Manual QA: All user/admin flows, accessibility, mobile, dark mode, real-time

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
VITE_API_URL=https://movie-booking-backend.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

### Deployment Platforms

- **Netlify**: Recommended for React apps

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

## Related

- See the root `README.md` and `backend/README.md` for full-stack setup, API, and deployment.
- For custom theming, see Tailwind config and global CSS.
- For accessibility, see ARIA usage in components. 