import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContextInstance';
import api from '../services/api';

interface PaymentFormProps {
  amount: number;
  selectedSeats: string[];
  showId: string;
  onPaymentSuccess: (paymentId: string, orderId: string) => void;
  onPaymentFailure: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  selectedSeats,
  showId,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user) {
      setError('Please login to proceed with payment');
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 Initializing payment:', { amount, selectedSeats, showId });

      // Initialize payment
      const response = await api.post('/payment/initialize', {
        amount,
        selectedSeats,
        showId,
      });

      const { orderId, key } = response.data;

      console.log('✅ Payment initialized:', { orderId, key });

      // Create Razorpay options
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Movie Booking System',
        description: `Booking ${selectedSeats.length} seat(s)`,
        order_id: orderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
          console.log('✅ Payment successful:', response);
          
          try {
            // Confirm booking
            const bookingResponse = await api.post('/bookings/confirm', {
              showId,
              seatNumbers: selectedSeats,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });

            console.log('✅ Booking confirmed:', bookingResponse.data);
            onPaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          } catch (bookingError) {
            console.error('❌ Booking confirmation failed:', bookingError);
            setError('Payment successful but booking failed. Please contact support.');
            onPaymentFailure();
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment modal dismissed');
            setLoading(false);
          },
        },
      };

      // Create Razorpay instance and open payment modal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const razorpay = new ((window as unknown as { Razorpay: new (options: any) => any }).Razorpay)(options);
      razorpay.open();

    } catch (error: unknown) {
      console.error('❌ Payment initialization failed:', error);
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Failed to initialize payment');
      setLoading(false);
      
      // Unlock seats after payment failure
      try {
        await api.post('/bookings/payment-failed', {
          showId,
          seatNumbers: selectedSeats,
        });
        console.log('🔓 Seats unlocked after payment failure');
      } catch (unlockError) {
        console.error('❌ Failed to unlock seats after payment failure:', unlockError);
      }
      
      onPaymentFailure();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Selected Seats:</span>
          <span className="font-medium">{selectedSeats.join(', ')}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Number of Seats:</span>
          <span className="font-medium">{selectedSeats.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Price per Seat:</span>
          <span className="font-medium">₹500</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Amount:</span>
            <span>₹{amount}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || selectedSeats.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        <div className="text-sm text-gray-600 text-center">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p>⏰ Seats will be held for 3 minutes during payment</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 