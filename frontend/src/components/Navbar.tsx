import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContextInstance';
import { useDarkMode } from '../hooks/useDarkMode';
import ReactDOM from 'react-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={closeMenus}
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">
              MovieBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
            >
              Movies
            </Link>
            <Link 
              to="/showtimes" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
            >
              Showtimes
            </Link>
            {user && (
              <Link 
                to="/my-bookings" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              >
                My Bookings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 card shadow-soft-dark animate-fade-in" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { console.log('Dropdown Logout clicked'); handleLogout(); }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          style={{ pointerEvents: 'auto', zIndex: 1001 }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-ghost"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu portal */}
      {typeof window !== 'undefined' && isMobileMenuOpen && ReactDOM.createPortal(
        <>
          {/* Backdrop for mobile menu */}
          <div 
            className="fixed left-0 right-0 top-16 bottom-0 bg-black/20 md:hidden"
            style={{ pointerEvents: 'auto', zIndex: 9999 }}
            onClick={closeMenus}
          />
          {/* Mobile Navigation */}
          <div className="fixed left-0 right-0 top-16 bg-white/80 dark:bg-gray-900/80 border-t border-white/20 dark:border-gray-800/20 animate-slide-up md:hidden"
            style={{ zIndex: 9999, pointerEvents: 'auto' }}>
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors duration-200"
                onClick={() => { console.log('Mobile Home clicked'); closeMenus(); }}
              >
                Home
              </Link>
              <Link
                to="/movies"
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors duration-200"
                onClick={() => { console.log('Mobile Movies clicked'); closeMenus(); }}
              >
                Movies
              </Link>
              <Link
                to="/showtimes"
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors duration-200"
                onClick={() => { console.log('Mobile Showtimes clicked'); closeMenus(); }}
              >
                Showtimes
              </Link>
              {user && (
                <Link
                  to="/my-bookings"
                  className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors duration-200"
                  onClick={() => { console.log('Mobile MyBookings clicked'); closeMenus(); }}
                >
                  My Bookings
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-primary hover:text-primary/80 hover:bg-primary/10 font-medium transition-colors duration-200"
                  onClick={() => { console.log('Mobile Admin clicked'); closeMenus(); }}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
              {/* Mobile User Section */}
              {user ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => { console.log('Mobile Logout clicked'); handleLogout(); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors duration-200"
                    onClick={() => { console.log('Mobile Login clicked'); closeMenus(); }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    onClick={() => { console.log('Mobile Register clicked'); closeMenus(); }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>, document.body
      )}

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar; 