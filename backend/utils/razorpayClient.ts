import Razorpay from 'razorpay';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_test_key_secret',
});

// Razorpay configuration for test mode
export const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_test_key_secret',
  currency: 'INR',
  name: 'Movie Booking System',
  description: 'Movie ticket booking',
  prefill: {
    name: '',
    email: '',
    contact: ''
  },
  notes: {
    address: 'Movie Theater'
  },
  theme: {
    color: '#3399cc'
  }
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt?: string) => {
  try {
    console.log('Creating Razorpay order:', { amount, currency, receipt });
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        booking_type: 'movie_booking'
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_test_key_secret')
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}; 