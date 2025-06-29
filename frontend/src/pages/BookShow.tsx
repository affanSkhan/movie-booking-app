import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { moviesAPI, showsAPI, seatsAPI } from '../services/api';
import { Clock, Calendar, MapPin, ArrowLeft, CreditCard, X, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <motion.div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
          </div>
          <p className="text-muted-foreground text-lg">Loading booking information...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !movie || !show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center bg-card border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || 'Show not found'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/movies')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Back to Movies
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { time, date } = formatShowTime(show.show_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(`/showtimes/${movie.id}`)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Showtimes
            </motion.button>

            {/* Enhanced Show Info */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-lg font-semibold text-foreground">{movie.title}</h1>
              <p className="text-sm text-muted-foreground">{time} • Screen {show.screen}</p>
            </motion.div>

            {/* Placeholder for balance */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Enhanced Movie Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 items-center"
          >
            {/* Enhanced Movie Poster */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={movie.poster_url || 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster'}
                  alt={movie.title}
                  className="w-20 h-30 object-cover rounded-xl shadow-lg border border-primary-foreground/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster';
                  }}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Enhanced Movie Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-3">{movie.title}</h2>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-primary-foreground/80 mb-3">
                <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {date}
                </div>
                <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  {time}
                </div>
                <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4" />
                  Screen {show.screen}
                </div>
              </div>

              {movie.duration && (
                <p className="text-sm text-primary-foreground/80">
                  Duration: {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Seat Map - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-2xl shadow-lg p-8 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Select Your Seats</h3>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
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

              {/* Enhanced Seat Legend */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded border border-border"></div>
                  <span className="text-foreground font-medium">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary rounded border"></div>
                  <span className="text-foreground font-medium">Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-destructive rounded border"></div>
                  <span className="text-foreground font-medium">Booked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded border"></div>
                  <span className="text-foreground font-medium">Locked</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Booking Summary - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-2xl shadow-lg p-8 sticky top-8 backdrop-blur-sm"
            >
              <h3 className="text-2xl font-semibold text-foreground mb-8">Booking Summary</h3>

              {/* Enhanced Selected Seats */}
              <div className="mb-8">
                <h4 className="font-medium text-foreground mb-4">Selected Seats</h4>
                {selectedSeats.length === 0 ? (
                  <p className="text-muted-foreground text-sm bg-muted/30 rounded-xl p-4 text-center">No seats selected</p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {selectedSeats.map((seatNumber) => (
                        <motion.div
                          key={seatNumber}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between bg-primary/10 rounded-xl p-4 border border-primary/20"
                        >
                          <span className="font-medium text-primary">Seat {seatNumber}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSeatDeselect(seatNumber)}
                            title={`Remove seat ${seatNumber}`}
                            className="text-primary hover:text-primary/80 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded-lg p-1"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Enhanced Price Breakdown */}
              <div className="border-t border-border/50 pt-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per seat:</span>
                    <span className="text-foreground font-medium">₹{seatPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of seats:</span>
                    <span className="text-foreground font-medium">{selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-border/50 pt-3">
                    <div className="flex justify-between font-semibold text-xl">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Proceed to Payment Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={selectedSeats.length === 0}
                onClick={handleProceedToPayment}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-card ${
                  selectedSeats.length === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed focus:ring-muted'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary shadow-lg hover:shadow-xl'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Pay ₹{totalPrice}
              </motion.button>

              {/* Enhanced Additional Info */}
              <div className="mt-6 text-xs text-muted-foreground text-center space-y-1">
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