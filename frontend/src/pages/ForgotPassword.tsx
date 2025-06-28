import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../utils/validation';
import type { ForgotPasswordFormData } from '../utils/validation';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

const ForgotPassword: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setToast(null);
    
    // Simulate API call with the email data
    console.log('Sending reset instructions to:', data.email);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Always show success message for security
    setToast({ 
      message: 'If an account exists for this email, reset instructions will be sent.', 
      type: 'success' 
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 lg:p-12 flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 opacity-20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10"
        >
          <div className="text-5xl lg:text-6xl mb-4 lg:mb-6">🔐</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Forgot Password?</h1>
          <p className="text-lg lg:text-xl mb-6 lg:mb-8 text-blue-100">
            Don't worry! Enter your email and we'll send you reset instructions
          </p>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">📧</span>
              </div>
              <span className="text-sm lg:text-base text-blue-100">Enter your email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">✅</span>
              </div>
              <span className="text-sm lg:text-base text-blue-100">Receive reset instructions</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">🔑</span>
              </div>
              <span className="text-sm lg:text-base text-blue-100">Create a new password</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800"
      >
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔐</div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Enter your email to reset your password</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Enter your email to reset</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative overflow-hidden group text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Sending instructions...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Send Reset Instructions</span>
                    <span className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Links */}
            <div className="mt-6 sm:mt-8 text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact our support team
              </p>
            </div>
          </motion.div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 