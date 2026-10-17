import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { useAuth } from './contexts/AuthContextInstance';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Movies from './pages/Movies';
import Showtimes from './pages/Showtimes';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import BookShow from './pages/BookShow';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}> = ({ children, requireAuth = false, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-orange-300/25 border-t-orange-400" aria-hidden="true" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Checking your session…</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminPanel = location.pathname === '/admin' && user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {!isAdminPanel && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/showtimes/:movieId" element={<Showtimes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/my-bookings" element={<ProtectedRoute requireAuth><MyBookings /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute requireAuth><Payment /></ProtectedRoute>} />
          <Route path="/booking-success" element={<ProtectedRoute requireAuth><BookingSuccess /></ProtectedRoute>} />
          <Route path="/book/:showId" element={<ProtectedRoute requireAuth><BookShow /></ProtectedRoute>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute requireAuth requireAdmin><AdminPanel /></ProtectedRoute>} />

          {/* Never expose auth tokens or stored user data through a public debug page. */}
          <Route path="/debug" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Keep the existing Render warm-up behaviour, using the real service URL as a safe fallback.
    const backendUrl = (import.meta.env.VITE_API_URL || (
      import.meta.env.DEV ? 'http://localhost:3001' : 'https://moviebook-backend-service.onrender.com'
    )).replace(/\/api\/?$/, '').replace(/\/+$/, '');

    const pingBackend = () => {
      fetch(backendUrl + '/health', { cache: 'no-store' }).catch(() => {
        // The app handles API availability in the relevant screens.
      });
    };

    pingBackend();
    const interval = window.setInterval(pingBackend, 300000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;