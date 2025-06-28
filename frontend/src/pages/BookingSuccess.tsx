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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Invalid Booking</h2>
          <p className="text-gray-600 mb-4">No booking information found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const { date, time } = formatShowTime(show.show_time);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="text-green-500 text-8xl mb-6">✅</div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your movie booking has been successfully confirmed. You will receive a confirmation email shortly.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Booking Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{booking.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Movie:</span>
                <span className="font-medium">{movie?.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{time}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Screen:</span>
                <span className="font-medium">{show.screen}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium">{selectedSeats.join(', ')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">₹{booking.total_amount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Book Another Movie
            </button>
            
            <button
              onClick={() => navigate('/my-bookings')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
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