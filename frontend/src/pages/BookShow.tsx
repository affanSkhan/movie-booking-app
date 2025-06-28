import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { moviesAPI, showsAPI, seatsAPI } from '../services/api';
import { Clock, Calendar, MapPin, ArrowLeft, CreditCard, X } from 'lucide-react';
import SeatMap from '../components/SeatMap';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
  created_at: string;
}

interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  screen: string;
  created_at: string;
}

interface Seat {
  id: number;
  show_id: number;
  seat_number: string;
  row_number: number;
  col_number: number;
  status: 'available' | 'locked' | 'booked';
}

const BookShow: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [seatPrice] = useState(250); // ₹250 per seat

  // Fetch show, movie, and seats data
  useEffect(() => {
    const fetchData = async () => {
      if (!showId) return;
      
      try {
        setLoading(true);
        const [showResponse, seatsResponse] = await Promise.all([
          showsAPI.getById(showId),
          seatsAPI.getByShow(showId)
        ]);
        
        setShow(showResponse.data);
        
        // Fetch movie data using the movie_id from show
        const movieResponse = await moviesAPI.getById(showResponse.data.movie_id.toString());
        setMovie(movieResponse.data);
        
        setSeats(seatsResponse.data);
      } catch (err) {
        setError('Failed to load booking information. Please try again.');
        console.error('Error fetching booking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // Handle seat selection
  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  // Handle seat deselection
  const handleSeatDeselect = (seatNumber: string) => {
    setSelectedSeats(prev => prev.filter(seat => seat !== seatNumber));
  };

  // Calculate total price
  const totalPrice = selectedSeats.length * seatPrice;

  // Format show time
  const formatShowTime = (showTime: string) => {
    const date = new Date(showTime);
    return {
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      setToast({ message: 'Please select at least one seat', type: 'error' });
      return;
    }
    
    // Navigate to payment with selected seats data
    navigate('/payment', {
      state: {
        showId,
        movie,
        show,
        selectedSeats,
        totalPrice,
        seatPrice
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !movie || !show) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error || 'Show not found'}</p>
          <button
            onClick={() => navigate('/movies')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const { time, date } = formatShowTime(show.show_time);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(`/showtimes/${movie.id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Showtimes
            </motion.button>

            {/* Show Info */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-lg font-semibold text-gray-900">{movie.title}</h1>
              <p className="text-sm text-gray-600">{time} • Screen {show.screen}</p>
            </motion.div>

            {/* Placeholder for balance */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Movie Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 items-center"
          >
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster_url || 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster'}
                alt={movie.title}
                className="w-20 h-30 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster';
                }}
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-blue-100 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Screen {show.screen}
                </div>
              </div>

              {movie.duration && (
                <p className="text-sm text-blue-100">
                  Duration: {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Select Your Seats</h3>
                <div className="text-sm text-gray-600">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </div>
              </div>

              {/* Seat Map Component */}
              <SeatMap
                showId={showId!}
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
              />

              {/* Seat Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded border"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded border"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
                  <span>Locked</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Summary - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h3>

              {/* Selected Seats */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Selected Seats</h4>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-500 text-sm">No seats selected</p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {selectedSeats.map((seatNumber) => (
                        <motion.div
                          key={seatNumber}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                        >
                          <span className="font-medium text-blue-900">Seat {seatNumber}</span>
                          <button
                            onClick={() => handleSeatDeselect(seatNumber)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per seat:</span>
                    <span>₹{seatPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of seats:</span>
                    <span>{selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={selectedSeats.length === 0}
                onClick={handleProceedToPayment}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedSeats.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Pay ₹{totalPrice}
              </motion.button>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>• Seats are held for 10 minutes</p>
                <p>• Payment required to confirm booking</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BookShow; 