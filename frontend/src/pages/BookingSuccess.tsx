import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, CreditCard, Home, BookOpen } from 'lucide-react';

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, movie, show, selectedSeats } = location.state || {};

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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center bg-card border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Invalid Booking</h2>
          <p className="text-muted-foreground mb-6">No booking information found.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Back to Movies
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { date, time } = formatShowTime(show.show_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="bg-card border border-border/50 rounded-2xl shadow-lg p-8 text-center backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Success Icon */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Booking Confirmed!
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your movie booking has been successfully confirmed. You will receive a confirmation email shortly.
          </motion.p>

          {/* Enhanced Booking Details */}
          <motion.div 
            className="bg-background/50 dark:bg-background/30 rounded-xl p-8 mb-8 text-left border border-border/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Booking Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-full text-sm">{booking.id}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Movie:</span>
                  <span className="font-medium text-foreground">{movie?.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {time}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Screen:</span>
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {show.screen}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seats:</span>
                  <span className="font-medium text-foreground bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                    {selectedSeats.join(', ')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium text-primary text-lg">₹{booking.total_amount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full text-sm">Paid</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Instructions */}
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">Important Information</h3>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                Please arrive at least 15 minutes before the show time
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                Bring a valid ID for verification
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                Present your booking ID at the ticket counter
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                No refunds or exchanges after booking confirmation
              </li>
            </ul>
          </motion.div>

          {/* Enhanced Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-3 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
            >
              <Home className="w-5 h-5" />
              Book Another Movie
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/my-bookings')}
              className="bg-muted hover:bg-muted/80 text-muted-foreground px-8 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-3 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-card"
            >
              <BookOpen className="w-5 h-5" />
              View My Bookings
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccess; 