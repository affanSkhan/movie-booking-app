import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Invalid Booking</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No booking information found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const { date, time } = formatShowTime(show.show_time);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Success Icon */}
          <div className="text-green-500 text-8xl mb-6">✅</div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Your movie booking has been successfully confirmed. You will receive a confirmation email shortly.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-left border border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Booking Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Movie:</span>
                <span className="font-medium text-gray-900 dark:text-white">{movie?.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{time}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Screen:</span>
                <span className="font-medium text-gray-900 dark:text-white">{show.screen}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.join(', ')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{booking.total_amount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Paid</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Important Information</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Please arrive at least 15 minutes before the show time</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Present your booking ID at the ticket counter</li>
              <li>• No refunds or exchanges after booking confirmation</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Book Another Movie
            </button>
            
            <button
              onClick={() => navigate('/my-bookings')}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 