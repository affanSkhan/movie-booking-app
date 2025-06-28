import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextInstance';
import { useSocket } from '../contexts/SocketContextInstance';
import { showsAPI, seatsAPI } from '../services/api';
import SeatMap from '../components/SeatMap';
import PaymentForm from '../components/PaymentForm';

interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  screen: string;
  created_at: string;
  movie_title?: string;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
}

interface Seat {
  id: number;
  seat_number: string;
  row_number: number;
  col_number: number;
  status: 'available' | 'locked' | 'booked';
  current_status?: 'available' | 'locked' | 'booked';
  locked_by?: number;
  lock_expires_at?: string;
}

const ShowBooking: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  
  const [show, setShow] = useState<Show | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!showId) {
      setError('Show ID is required');
      setLoading(false);
      return;
    }

    loadShowAndSeats();
  }, [showId, user, navigate]);

  const loadShowAndSeats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎬 Loading show and seats for show ID:', showId);

      const [showResponse, seatsResponse] = await Promise.all([
        showsAPI.getById(showId!),
        seatsAPI.getByShow(showId!),
      ]);

      console.log('Show response:', showResponse.data);
      console.log('Seats response:', seatsResponse.data);

      setShow(showResponse.data);
      setSeats(seatsResponse.data);

      // Fetch movie details if available
      if (showResponse.data.movie_title) {
        setMovie({
          id: showResponse.data.movie_id,
          title: showResponse.data.movie_title,
          description: '',
          poster_url: '',
        });
      }

      console.log('✅ Show and seats loaded:', {
        show: showResponse.data,
        seatsCount: seatsResponse.data.length
      });

    } catch (err) {
      console.error('❌ Error loading show and seats:', err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 
        `Failed to load show details. Status: ${error.response?.status || 'Unknown'}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber: string) => {
    console.log('🪑 Seat selected:', seatNumber);
    setSelectedSeats(prev => [...prev, seatNumber]);
  };

  const handleSeatDeselect = (seatNumber: string) => {
    console.log('🪑 Seat deselected:', seatNumber);
    setSelectedSeats(prev => prev.filter(seat => seat !== seatNumber));
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    console.log('✅ Payment successful:', { paymentId, orderId });
    setPaymentId(paymentId);
    setOrderId(orderId);
    setBookingSuccess(true);
    
    // Clear selected seats
    setSelectedSeats([]);
    
    // Reload seats to show updated status
    setTimeout(() => {
      loadShowAndSeats();
    }, 1000);
  };

  const handlePaymentFailure = () => {
    console.log('❌ Payment failed');
    // Clear selected seats
    setSelectedSeats([]);
    
    // Reload seats to show updated status
    setTimeout(() => {
      loadShowAndSeats();
    }, 1000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your seats have been booked successfully.
          </p>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <p><strong>Payment ID:</strong> {paymentId}</p>
            <p><strong>Order ID:</strong> {orderId}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Show Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { date, time } = formatShowTime(show.show_time);
  const totalAmount = selectedSeats.length * 500;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{movie?.title || 'Movie Booking'}</h1>
              <div className="text-gray-600 mt-2">
                <p>📅 {date}</p>
                <p>🕒 {time} • Screen {show.screen}</p>
                <p>💰 Price per Seat: ₹500</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Selected Seats</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedSeats.length}
              </p>
              <p className="text-sm text-gray-600">
                Total: ₹{totalAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
              <p>Total Amount: ₹{totalAmount}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Seats</h2>
              <SeatMap
                showId={showId!}
                seats={seats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                selectedSeats={selectedSeats}
              />
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-1">
            <PaymentForm
              amount={totalAmount}
              selectedSeats={selectedSeats}
              showId={showId!}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">How to Book Seats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">1. Select Seats</h4>
              <p className="text-gray-600">Click on available seats (🟢) to select them. Selected seats will turn orange (🟠).</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">2. Unselect if Needed</h4>
              <p className="text-gray-600">Click on your selected seats (🟠) again to unselect them. They'll return to available (🟢).</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">3. Complete Payment</h4>
              <p className="text-gray-600">Once satisfied with your selection, proceed to payment. Seats are held for 3 minutes during payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowBooking; 