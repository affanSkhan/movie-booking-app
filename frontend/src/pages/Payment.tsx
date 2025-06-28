import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Clock, MapPin, Calendar } from 'lucide-react';
import PaymentForm from '../components/PaymentForm';
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
  
  // Get payment data from navigation state
  const paymentData = location.state as PaymentState;

  useEffect(() => {
    // Redirect if no payment data
    if (!paymentData) {
      setToast({ message: 'No booking data found. Please try again.', type: 'error' });
      setTimeout(() => {
        navigate('/movies');
      }, 2000);
    }
  }, [paymentData, navigate]);

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

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const { time, date } = formatShowTime(paymentData.show.show_time);

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
              onClick={() => navigate(`/book/${paymentData.showId}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Booking
            </motion.button>

            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-lg font-semibold text-gray-900">Complete Payment</h1>
              <p className="text-sm text-gray-600">Secure payment powered by Razorpay</p>
            </motion.div>

            {/* Placeholder for balance */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Movie Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={paymentData.movie.poster_url || 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster'}
                      alt={paymentData.movie.title}
                      className="w-20 h-30 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/80x120/1f2937/ffffff?text=No+Poster';
                      }}
                    />
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold mb-2">{paymentData.movie.title}</h2>
                    
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
                        Screen {paymentData.show.screen}
                      </div>
                    </div>

                    {paymentData.movie.duration && (
                      <p className="text-sm text-blue-100">
                        Duration: {Math.floor(paymentData.movie.duration / 60)}h {paymentData.movie.duration % 60}m
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h3>
                
                <div className="space-y-4">
                  {/* Selected Seats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Selected Seats</h4>
                    <div className="flex flex-wrap gap-2">
                      {paymentData.selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price per seat:</span>
                        <span>₹{paymentData.seatPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Number of seats:</span>
                        <span>{paymentData.selectedSeats.length}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total Amount:</span>
                          <span>₹{paymentData.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Important Information</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Seats are held for 10 minutes during payment</li>
                      <li>• Payment is processed securely via Razorpay</li>
                      <li>• You'll receive a confirmation email after successful payment</li>
                      <li>• Tickets are non-refundable once confirmed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Form - Takes 1/3 of the space */}
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
              />
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