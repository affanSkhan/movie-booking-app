import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContextInstance';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMobileMenu}>
              <span className="text-lg sm:text-xl font-bold">🎬 Movie Booking</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/movies"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Movies
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Bookings
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm hidden lg:block">
                    Welcome, {user.name}
                  </span>
                  <span className="text-yellow-400 text-xs bg-gray-700 dark:bg-gray-600 px-2 py-1 rounded">
                    {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Dark Mode Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 dark:bg-gray-900 border-t border-gray-700">
              <Link
                to="/movies"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                Movies
              </Link>

              {user ? (
                <>
                  <Link
                    to="/my-bookings"
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <div className="px-3 py-2">
                    <div className="text-gray-300 text-sm mb-2">
                      Welcome, {user.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-xs bg-gray-700 dark:bg-gray-600 px-2 py-1 rounded">
                        Role: {user.role}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium text-center"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 