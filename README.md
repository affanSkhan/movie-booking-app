# 🎬 Movie Booking System

A full-stack movie theater booking platform with real-time seat selection, payment integration, and a modern admin panel. Built for performance, accessibility, and a beautiful user experience.

---

## ⭐ Features

- **Real-time Seat Selection**: Live seat updates via Socket.IO
- **Interactive Seat Map**: Visual, color-coded, accessible seat selection
- **Payment Integration**: Secure payments with Razorpay
- **Admin Panel**: Sidebar-based dashboard with stats, charts (Recharts), and real-time analytics
- **Responsive Design**: Mobile-first, tablet, and desktop support
- **Dark Mode**: Toggleable, system-aware, and accessible
- **Modern UI/UX**: Glassmorphism, gradients, smooth transitions (Framer Motion), custom buttons/inputs
- **Accessibility**: ARIA labels, focus indicators, keyboard navigation, color contrast
- **User Authentication**: JWT-based, role-based access
- **Database Locking**: Prevents double booking
- **Security**: Input validation, password hashing, CORS, SQL injection prevention

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite**
- **Tailwind CSS** (with CSS variable-based color theming)
- **Framer Motion** (animations)
- **Recharts** (admin analytics)
- **Socket.IO Client**
- **Razorpay** (payments)

### Backend
- **Bun** (runtime, instead of Node.js)
- **Express** + TypeScript
- **PostgreSQL**
- **Socket.IO**
- **JWT**
- **Razorpay**

---

## 🌐 Live Demo

- **Frontend**: https://movie-booking-pf.netlify.app/
- **Backend API**: https://moviebook-backend-service.onrender.com
- **Admin Panel**: https://movie-booking-pf.netlify.app/admin/login

---

## 📋 Prerequisites

- Bun (recommended) or Node.js 18+
- PostgreSQL
- Razorpay account (for payments)

---

## 🏗️ Local Development

### 1. Clone Repository
```bash
git clone https://github.com/affanSkhan/movie-booking-app.git
cd movie-booking-system
```

### 2. Backend Setup
```bash
cd backend
bun install
cp env.example .env # Edit .env with your DB and Razorpay credentials
bun run dev
```

### 3. Frontend Setup
```bash
cd frontend
bun install
cp env.example .env # Edit .env with your backend API URL
bun run dev
```

### 4. Database Setup
```sql
psql -d your_database -f backend/enhanced_database.sql
psql -d your_database -f backend/sample_data.sql
psql -d your_database -f backend/sample_booking_data.sql
```

---

## 🎨 UI/UX & Accessibility

- **Design Tokens**: Tailwind config uses CSS variables for color theming (see `frontend/tailwind.config.js`)
- **Dark Mode**: Toggle or system preference (`darkMode: 'class'` in Tailwind)
- **Glassmorphism & Gradients**: Modern, soft backgrounds
- **Custom Buttons & Inputs**: Consistent, accessible, animated
- **Transitions**: Framer Motion for page/component transitions
- **Accessibility**: ARIA labels, keyboard navigation, focus rings, color contrast

---

## 📊 Admin Panel

- **top Navigation bar**: Accessible, keyboard-friendly
- **Dashboard**: Stats cards, charts (Recharts), real-time analytics (polling/WebSocket-ready)
- **Modular Components**: Sidebar, StatsCards, DashboardCharts
- **Live Updates**: Booking stats auto-refresh
- **Animations**: Framer Motion for smooth transitions

---

## 🔒 Security

- JWT authentication
- Password hashing (bcrypt)
- Role-based access
- Input validation (zod)
- SQL injection prevention (parameterized queries)
- CORS configuration

---

## 🔗 API Endpoints (Sample)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Movies
- `GET /api/movies` - Get all movies
- `POST /api/movies` - Create movie (admin)
- ...

### Shows
- `GET /api/shows/movie/:movieId` - Get shows for a movie
- ...

### Seats
- `GET /api/seats/show/:showId` - Get seats for a show
- ...

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- ...

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- ...

---

## ��‍💻 Deployment

### Render (Backend) + Netlify (Frontend) - Recommended

#### Backend (Render)
- Deploy backend to [Render](https://render.com)
- Add PostgreSQL
- Set environment variables (see backend/README.md)
- Backend URL: https://movie-booking-backend.onrender.com

#### Frontend (Netlify)
- Deploy frontend to [Netlify](https://netlify.com)
- Set environment variables (see frontend/README.md)
- Frontend URL: https://movie-booking-frontend.netlify.app

---

## 🛂 Admin Access (Demo)
- **Email**: admin@moviebooking.com
- **Password**: admin123

---

## 🧪 QA & Testing
- Linting: `bun run lint` (frontend/backend)
- Prettier: `bun run format` (if configured)
- Manual QA: All user/admin flows, accessibility, mobile, dark mode, real-time

---

## 📁 Project Structure

```
movie-booking-system/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── index.ts
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   ├── tailwind.config.js
│   └── ...
└── README.md
```

---

## 📚 More Info
- See `backend/README.md` and `frontend/README.md` for detailed setup, API, and features.
- For custom theming, see Tailwind config and global CSS.
- For accessibility, see ARIA usage in components.

---

## © 2024 Your Name. MIT License. 