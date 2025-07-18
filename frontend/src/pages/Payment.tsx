import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, Shield, CreditCard } from 'lucide-react';
import PaymentForm from '../components/PaymentForm';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import api from '../services/api';

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

interface PaymentState {
  showId: string;
  movie: Movie;
  show: Show;
  selectedSeats: string[];
  totalPrice: number;
  seatPrice: number;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const paymentCompletedRef = useRef(false);
  const [paymentFlowActive, setPaymentFlowActive] = useState(false);
  
  // Get payment data from navigation state
  const paymentData = location.state as PaymentState & { paymentStart?: number };

  // Always use 250 for seat price
  const seatPrice = 250;

  useEffect(() => {
    // Redirect if no payment data
    if (!paymentData) {
      setToast({ message: 'No booking data found. Please try again.', type: 'error' });
      setTimeout(() => {
        navigate('/movies');
      }, 2000);
      return;
    }
    // Calculate time left if paymentStart is provided
    let initialTime = 600;
    if (paymentData.paymentStart) {
      const elapsed = Math.floor((Date.now() - paymentData.paymentStart) / 1000);
      initialTime = Math.max(600 - elapsed, 0);
    }
    setPaymentTimeLeft(initialTime);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPaymentTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          setToast({ message: 'Your selected seats have expired.', type: 'error' });
          // Call unlock API to unlock seats for others
          if (paymentData?.showId && paymentData?.selectedSeats) {
            api.post('/bookings/payment-failed', {
              showId: paymentData.showId,
              seatNumbers: paymentData.selectedSeats,
            }).finally(() => {
              setTimeout(() => navigate('/movies'), 3000);
            });
          } else {
            setTimeout(() => navigate('/movies'), 3000);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paymentData, navigate]);

  // Only enable unlock logic if paymentFlowStarted flag is set
  useEffect(() => {
    if (sessionStorage.getItem('paymentFlowStarted') === 'true') {
      setPaymentFlowActive(true);
    }
    // Clear the flag on unmount
    return () => {
      sessionStorage.removeItem('paymentFlowStarted');
    };
  }, []);

  // Unlock seats if user leaves payment page before completing payment
  useEffect(() => {
    if (!paymentFlowActive) return;
    const unlockSeats = () => {
      if (!paymentCompletedRef.current && paymentData?.showId && paymentData?.selectedSeats?.length) {
        api.post('/bookings/payment-failed', {
          showId: paymentData.showId,
          seatNumbers: paymentData.selectedSeats,
        });
      }
    };
    // On unmount (navigation away)
    return () => {
      unlockSeats();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFlowActive, paymentData?.showId, paymentData?.selectedSeats]);

  // Unlock seats on browser/tab close
  useEffect(() => {
    if (!paymentFlowActive) return;
    const handleBeforeUnload = () => {
      if (!paymentCompletedRef.current && paymentData?.showId && paymentData?.selectedSeats?.length) {
        navigator.sendBeacon(
          api.defaults.baseURL + '/bookings/payment-failed',
          JSON.stringify({
            showId: paymentData.showId,
            seatNumbers: paymentData.selectedSeats,
          })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFlowActive, paymentData?.showId, paymentData?.selectedSeats]);

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

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    paymentCompletedRef.current = true;
    sessionStorage.removeItem('paymentFlowStarted');
    setToast({ 
      message: 'Payment successful! Redirecting to booking confirmation...', 
      type: 'success' 
    });
    
    setTimeout(() => {
      navigate('/booking-success', {
        state: {
          paymentId,
          orderId,
          bookingData: paymentData
        }
      });
    }, 2000);
  };

  const handlePaymentFailure = () => {
    setToast({ 
      message: 'Payment failed. Please try again.', 
      type: 'error' 
    });
  };

  // Add a function to set paymentCompletedRef
  const markPaymentStarted = () => {
    paymentCompletedRef.current = true;
  };
  const markPaymentNotCompleted = () => {
    paymentCompletedRef.current = false;
  };

  if (!paymentData) {
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
          <p className="text-muted-foreground text-lg">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  const { time, date } = formatShowTime(paymentData.show.show_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 mt-16">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Complete Payment</h1>
              </div>
              <p className="text-sm text-muted-foreground">Secure payment powered by Razorpay</p>
            </motion.div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>
      {/* Payment Timer - move above booking summary and style as sticky if time is low */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex justify-center">
          <div className={`text-lg font-bold rounded-xl px-4 py-2 shadow-md bg-white dark:bg-gray-900 border border-border/50 ${paymentTimeLeft <= 60 ? 'text-destructive bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 animate-pulse sticky top-0 z-20' : 'text-primary'}`}>
            Time left to complete payment: {Math.floor(paymentTimeLeft/60).toString().padStart(2,'0')}:{(paymentTimeLeft%60).toString().padStart(2,'0')}
          </div>
        </div>
      </div>
      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Booking Summary - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Enhanced Movie Banner */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Enhanced Movie Poster */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={paymentData.movie.poster_url || 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster'}
                        alt={paymentData.movie.title}
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
                    <h2 className="text-2xl font-bold mb-3">{paymentData.movie.title}</h2>
                    
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
                        Screen {paymentData.show.screen}
                      </div>
                    </div>

                    {paymentData.movie.duration != null && (
                      <p className="text-sm text-primary-foreground/80">
                        Duration: {Math.floor(paymentData.movie.duration / 60)}h {paymentData.movie.duration % 60}m
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Booking Details */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-8">Booking Summary</h3>
                
                <div className="space-y-6">
                  {/* Enhanced Selected Seats */}
                  <div className="bg-background/50 dark:bg-background/30 rounded-xl p-6 border border-border/50">
                    <h4 className="font-medium text-foreground mb-4">Selected Seats</h4>
                    <div className="flex flex-wrap gap-3">
                      {paymentData.selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                        >
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Price Breakdown */}
                  <div className="bg-background/50 dark:bg-background/30 rounded-xl p-6 border border-border/50">
                    <h4 className="font-medium text-foreground mb-4">Price Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per seat:</span>
                        <span className="text-foreground font-medium">₹{seatPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Number of seats:</span>
                        <span className="text-foreground font-medium">{paymentData.selectedSeats.length}</span>
                      </div>
                      <div className="border-t border-border/50 pt-3">
                        <div className="flex justify-between font-semibold text-xl">
                          <span className="text-foreground">Total Amount:</span>
                          <span className="text-primary">₹{paymentData.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Important Notes */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important Information</h4>
                    </div>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        Seats are held for 10 minutes during payment
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        Payment is processed securely via Razorpay
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        You'll receive a confirmation email after successful payment
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        Tickets are non-refundable once confirmed
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Payment Form - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <PaymentForm
                amount={paymentData.totalPrice}
                selectedSeats={paymentData.selectedSeats}
                showId={paymentData.showId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                disabled={expired}
                onPaymentStart={markPaymentStarted}
                onPaymentCancel={markPaymentNotCompleted}
              />
              {expired && (
                <div className="mt-4 text-center text-destructive font-semibold">Your selected seats have expired.</div>
              )}
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

export default Payment; 