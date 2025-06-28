import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema } from '../utils/validation';
import type { AdminLoginFormData } from '../utils/validation';
import { useAuth } from '../contexts/AuthContextInstance';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { AxiosError } from 'axios';

const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true);
    setToast(null);
    try {
      await adminLogin(data.email, data.password);
      setToast({ message: 'Admin login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/admin'), 1000);
    } catch (err: unknown) {
      let message = 'Admin login failed. Please check your credentials.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-8 lg:p-12 flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10"
        >
          <div className="text-5xl lg:text-6xl mb-4 lg:mb-6">👑</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Admin Dashboard</h1>
          <p className="text-lg lg:text-xl mb-6 lg:mb-8 text-purple-100">
            Access your movie booking system administration panel
          </p>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">🎬</span>
              </div>
              <span className="text-sm lg:text-base text-purple-100">Manage movies and shows</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">📊</span>
              </div>
              <span className="text-sm lg:text-base text-purple-100">View booking analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm">⚙️</span>
              </div>
              <span className="text-sm lg:text-base text-purple-100">System configuration</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800"
      >
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👑</div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Access your administration panel</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Enter your admin credentials</p>
            </div>

            {/* Google Button Placeholder */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 mb-6 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base"
              disabled
              aria-label="Continue with Google"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.77 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.04l7.19 5.59C43.93 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.09c-1.01-2.99-1.01-6.19 0-9.18l-7.98-6.2C.64 16.1 0 19 0 22c0 3.01.64 5.91 1.77 8.29l7.98-6.2z"/><path fill="#EA4335" d="M24 44c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.38 0-11.87-3.59-14.33-8.74l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Continue with Google
            </button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Email
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
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-700 dark:text-white'
                    }`}
                    placeholder="Enter admin email"
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                      errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-700 dark:text-white'
                    }`}
                    placeholder="Enter admin password"
                  />
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 relative overflow-hidden group text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Sign In as Admin</span>
                    <span className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Links */}
            <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
              <div>
                <Link
                  to="/login"
                  className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  ← Back to User Login
                </Link>
              </div>
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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

export default AdminLogin; 