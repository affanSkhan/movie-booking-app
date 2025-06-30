import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextInstance';
import { bookingsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Ticket, RefreshCw, Film, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

interface Booking {
  id: number;
  show_id: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  movie_title: string;
  show_time: string;
  screen: string;
  seat_numbers: string[];
}

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data);
    } catch {
      setError('Failed to load your bookings. Please try again.');
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatShowTime = (showTime: string) => {
    const date = new Date(showTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const formatBookingDate = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 mt-16">
      {/* Enhanced Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div></div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Bookings</h1>
              <p className="text-muted-foreground">Your booking history</p>
            </motion.div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-destructive text-6xl mb-6">⚠️</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Error Loading Bookings</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <motion.button 
                onClick={fetchBookings} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-destructive/90 focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-border/50">
              <div className="text-muted-foreground text-8xl mb-6">🎫</div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-8 text-lg">You haven't made any bookings yet. Start by exploring our movies!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/movies" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background inline-flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Browse Movies
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Your Bookings ({bookings.length})</h2>
              <motion.button 
                onClick={fetchBookings} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking, index) => {
                const { date, time } = formatShowTime(booking.show_time);
                return (
                  <motion.div 
                    key={booking.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 overflow-hidden group"
                  >
                    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-xl truncate">{booking.movie_title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          booking.payment_status === 'paid' 
                            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                      <p className="text-primary-foreground/80 text-sm">Booking #{booking.id}</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Screen {booking.screen}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Ticket className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Seats: {booking.seat_numbers?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Total Amount:
                          </span>
                          <span className="font-bold text-lg text-foreground">₹{booking.total_amount}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Booked on {formatBookingDate(booking.created_at)}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MyBookings; 