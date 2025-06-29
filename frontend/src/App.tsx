import React from 'react';
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
import MovieDetails from './pages/MovieDetails';
import ShowBooking from './pages/ShowBooking';
import BookShow from './pages/BookShow';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAuth?: boolean; requireAdmin?: boolean }> = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Debug Component to check JWT and user data
const DebugInfo: React.FC = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return 'Invalid JWT';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Information</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">User Data (localStorage)</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {user ? JSON.stringify(JSON.parse(user), null, 2) : 'No user data'}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">JWT Token</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {token || 'No token found'}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Decoded JWT Payload</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {token ? JSON.stringify(decodeJWT(token), null, 2) : 'No token to decode'}
        </pre>
      </div>
    </div>
  );
};

// App Routes Component (uses AuthContext) - Now inside Router context
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  // Hide main navbar ONLY when on /admin and user is admin
  const isAdminPanel = location.pathname === '/admin' && user?.role === 'admin';
  const showMainNavbar = !isAdminPanel;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showMainNavbar && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/showtimes/:movieId" element={<Showtimes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          
          {/* Protected Routes */}
          <Route 
            path="/booking/:showId" 
            element={
              <ProtectedRoute requireAuth>
                <ShowBooking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book/:showId" 
            element={
              <ProtectedRoute requireAuth>
                <BookShow />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute requireAuth>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute requireAuth>
                <Payment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking-success" 
            element={
              <ProtectedRoute requireAuth>
                <BookingSuccess />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Debug Route */}
          <Route path="/debug" element={<DebugInfo />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
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