import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContextInstance';
import api from '../services/api';

interface PaymentFormProps {
  amount: number;
  selectedSeats: string[];
  showId: string;
  onPaymentSuccess: (paymentId: string, orderId: string) => void;
  onPaymentFailure: () => void;
  disabled?: boolean;
  onPaymentStart?: () => void;
  onPaymentCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  selectedSeats,
  showId,
  onPaymentSuccess,
  onPaymentFailure,
  disabled,
  onPaymentStart,
  onPaymentCancel,
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
    if (onPaymentStart) onPaymentStart();
    if (!user) {
      setError('Please login to proceed with payment');
      if (onPaymentCancel) onPaymentCancel();
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      if (onPaymentCancel) onPaymentCancel();
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
            if (onPaymentCancel) onPaymentCancel();
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
      
      if (onPaymentCancel) onPaymentCancel();
      onPaymentFailure();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Selected Seats:</span>
          <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.join(', ')}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Number of Seats:</span>
          <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Price per Seat:</span>
          <span className="font-medium text-gray-900 dark:text-white">₹250</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Total Amount:</span>
            <span className="text-gray-900 dark:text-white">₹{amount}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || selectedSeats.length === 0 || disabled}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 