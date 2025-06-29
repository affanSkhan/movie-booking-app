import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../utils/validation';
import type { ForgotPasswordFormData } from '../utils/validation';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { Mail, Key, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Enhanced Left Side - Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 lg:p-12 flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <Key className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-5xl lg:text-6xl">🔐</div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">Forgot Password?</h1>
          <p className="text-xl lg:text-2xl mb-8 lg:mb-10 text-primary-foreground/80 leading-relaxed">
            Don't worry! Enter your email and we'll send you reset instructions
          </p>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl text-primary-foreground/90">Enter your email address</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl text-primary-foreground/90">Receive reset instructions</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl text-primary-foreground/90">Create a new password</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8"
      >
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl">🔐</div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground text-base">Enter your email to reset your password</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-card border border-border/50 rounded-2xl shadow-lg p-8 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Forgot Password?</h2>
              <p className="text-muted-foreground text-base">Enter your email to reset</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Enhanced Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-12 pr-4 py-4 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base placeholder-muted-foreground ${
                      errors.email ? 'border-destructive focus:ring-destructive/20' : 'focus:ring-primary/20'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <span className="text-destructive text-sm mt-2 block">{errors.email.message}</span>}
              </div>

              {/* Enhanced Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card relative overflow-hidden group text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                    Sending instructions...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Send Reset Instructions</span>
                    <span className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Enhanced Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
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