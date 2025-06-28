import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextInstance';
import { bookingsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your booking history</p>
            </motion.div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Bookings</h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button onClick={fetchBookings} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">Try Again</button>
            </div>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't made any bookings yet. Start by exploring our movies!</p>
              <Link to="/movies" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Browse Movies</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Bookings ({bookings.length})</h2>
              <button onClick={fetchBookings} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Refresh</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking, index) => {
                const { date, time } = formatShowTime(booking.show_time);
                return (
                  <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg truncate">{booking.movie_title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.payment_status === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>{booking.payment_status}</span>
                      </div>
                      <p className="text-blue-100 text-sm">Booking #{booking.id}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Calendar className="w-4 h-4" /><span>{date}</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Clock className="w-4 h-4" /><span>{time}</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /><span>Screen {booking.screen}</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Ticket className="w-4 h-4" /><span>Seats: {booking.seat_numbers?.join(', ') || 'N/A'}</span></div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">₹{booking.total_amount}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Booked on {formatBookingDate(booking.created_at)}</div>
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