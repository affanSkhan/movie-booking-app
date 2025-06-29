import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContextInstance';
import { moviesAPI, showsAPI, bookingsAPI } from '../services/api';
import { BarChart3, Film, Calendar, Ticket, LogOut, Edit, Trash2, X, Save, Sun, Moon } from 'lucide-react';
import StatsCards from '../components/admin/StatsCards';
import DashboardCharts from '../components/admin/DashboardCharts';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
  created_at: string;
}

interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  screen: string;
  created_at: string;
}

interface Booking {
  id: number;
  user_id: number;
  show_id: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  user_name: string;
  movie_title: string;
  show_time: string;
  seat_numbers: string[];
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    bookingsToday: 0,
    totalRevenue: 0,
    activeShows: 0,
    totalMovies: 0,
    totalUsers: 0
  });

  // Form states
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    poster_url: '',
    duration: '',
  });

  const [newShow, setNewShow] = useState({
    movie_id: '',
    show_time: '',
    screen: '',
  });

  // Edit states
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [editMovieForm, setEditMovieForm] = useState({
    title: '',
    description: '',
    poster_url: '',
    duration: '',
  });
  const [editShowForm, setEditShowForm] = useState({
    movie_id: '',
    show_time: '',
    screen: '',
  });

  // Loading states
  const [updatingMovie, setUpdatingMovie] = useState(false);
  const [updatingShow, setUpdatingShow] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState<number | null>(null);
  const [deletingShow, setDeletingShow] = useState<number | null>(null);

  // Confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'movie' | 'show' | null;
    id: number | null;
    title: string;
  }>({ type: null, id: null, title: '' });

  // Dark mode
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  useEffect(() => {
    // On mount, respect saved theme
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesRes, showsRes, bookingsRes] = await Promise.all([
        moviesAPI.getAll(),
        showsAPI.getByMovie('all'),
        bookingsAPI.getAllBookings(),
      ]);

      setMovies(moviesRes.data);
      setShows(showsRes.data);
      setBookings(bookingsRes.data);

      // Calculate stats
      const today = new Date().toDateString();
      const bookingsToday = bookingsRes.data.filter((booking: Booking) => 
        new Date(booking.created_at).toDateString() === today
      ).length;

      const totalRevenue = bookingsRes.data.reduce((sum: number, booking: Booking) => 
        booking.payment_status === 'paid' ? sum + booking.total_amount : sum, 0
      );

      const activeShows = showsRes.data.filter((show: Show) => 
        new Date(show.show_time) > new Date()
      ).length;

      // Get unique users
      const uniqueUsers = new Set(bookingsRes.data.map((booking: Booking) => booking.user_id)).size;

      setStats({
        totalBookings: bookingsRes.data.length,
        bookingsToday,
        totalRevenue,
        activeShows,
        totalMovies: moviesRes.data.length,
        totalUsers: uniqueUsers
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moviesAPI.create({
        ...newMovie,
        duration: newMovie.duration ? parseInt(newMovie.duration) : undefined,
      });
      setNewMovie({ title: '', description: '', poster_url: '', duration: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await showsAPI.create({
        movie_id: parseInt(newShow.movie_id),
        show_time: newShow.show_time,
        screen: newShow.screen,
      });
      setNewShow({ movie_id: '', show_time: '', screen: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding show:', error);
    }
  };

  // Edit handlers
  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setEditMovieForm({
      title: movie.title,
      description: movie.description,
      poster_url: movie.poster_url || '',
      duration: movie.duration?.toString() || '',
    });
  };

  const handleEditShow = (show: Show) => {
    setEditingShow(show);
    setEditShowForm({
      movie_id: show.movie_id.toString(),
      show_time: show.show_time.slice(0, 16), // Format for datetime-local input
      screen: show.screen,
    });
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      setUpdatingMovie(true);
      await moviesAPI.update(editingMovie.id.toString(), {
        ...editMovieForm,
        duration: editMovieForm.duration ? parseInt(editMovieForm.duration) : undefined,
      });
      setEditingMovie(null);
      setEditMovieForm({ title: '', description: '', poster_url: '', duration: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating movie:', error);
    } finally {
      setUpdatingMovie(false);
    }
  };

  const handleUpdateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShow) return;

    try {
      setUpdatingShow(true);
      await showsAPI.update(editingShow.id.toString(), {
        movie_id: parseInt(editShowForm.movie_id),
        show_time: editShowForm.show_time,
        screen: editShowForm.screen,
      });
      setEditingShow(null);
      setEditShowForm({ movie_id: '', show_time: '', screen: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating show:', error);
    } finally {
      setUpdatingShow(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMovie(null);
    setEditingShow(null);
    setEditMovieForm({ title: '', description: '', poster_url: '', duration: '' });
    setEditShowForm({ movie_id: '', show_time: '', screen: '' });
  };

  // Delete handlers
  const handleDeleteMovie = (movie: Movie) => {
    setDeleteConfirm({
      type: 'movie',
      id: movie.id,
      title: movie.title,
    });
  };

  const handleDeleteShow = (show: Show) => {
    const movieTitle = movies.find(m => m.id === show.movie_id)?.title || 'Unknown Movie';
    setDeleteConfirm({
      type: 'show',
      id: show.id,
      title: `${movieTitle} - ${new Date(show.show_time).toLocaleString()}`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;

    try {
      if (deleteConfirm.type === 'movie') {
        setDeletingMovie(deleteConfirm.id);
        await moviesAPI.delete(deleteConfirm.id.toString());
      } else {
        setDeletingShow(deleteConfirm.id);
        await showsAPI.delete(deleteConfirm.id.toString());
      }
      setDeleteConfirm({ type: null, id: null, title: '' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeletingMovie(null);
      setDeletingShow(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ type: null, id: null, title: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'movies', name: 'Movies', icon: Film },
    { id: 'shows', name: 'Shows', icon: Calendar },
    { id: 'bookings', name: 'Bookings', icon: Ticket },
  ];

  // Generate chart data
  const generateChartData = () => {
    // Last 7 days booking data
    const bookingData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const dayBookings = bookings.filter(booking => 
        new Date(booking.created_at).toDateString() === date.toDateString()
      ).length;
      return { date: dateStr, bookings: dayBookings };
    }).reverse();

    // Last 7 days revenue data
    const revenueData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const dayRevenue = bookings.filter(booking => 
        new Date(booking.created_at).toDateString() === date.toDateString() &&
        booking.payment_status === 'paid'
      ).reduce((sum, booking) => sum + booking.total_amount, 0);
      return { date: dateStr, revenue: dayRevenue };
    }).reverse();

    // Popular movies data
    const movieBookings = bookings.reduce((acc, booking) => {
      acc[booking.movie_title] = (acc[booking.movie_title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularMovies = Object.entries(movieBookings)
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return { bookingData, revenueData, popularMovies };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <motion.div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
          </div>
          <p className="text-muted-foreground text-lg">Loading admin panel...</p>
        </motion.div>
      </div>
    );
  }

  const { bookingData, revenueData, popularMovies } = generateChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Top Navigation */}
      <nav className="glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-gradient">Admin Panel</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.name}
              </div>
              <motion.button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-foreground hover:bg-muted/20 transition-colors duration-200"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'} Mode</span>
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border/50">
          <div className="px-4 py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'movies' && 'Manage Movies'}
            {activeTab === 'shows' && 'Manage Shows'}
            {activeTab === 'bookings' && 'View Bookings'}
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <StatsCards stats={stats} />
            <DashboardCharts
              bookingData={bookingData}
              revenueData={revenueData}
              popularMovies={popularMovies}
            />
          </motion.div>
        )}

        {/* Movies Tab */}
        {activeTab === 'movies' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Add Movie Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Movie</h3>
              <form onSubmit={handleAddMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Movie Title"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Poster URL (optional)"
                  value={newMovie.poster_url}
                  onChange={(e) => setNewMovie({ ...newMovie, poster_url: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Duration in minutes (optional)"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description"
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Add Movie
                </button>
              </form>
            </div>

            {/* Movies List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Movies ({movies.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Movie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {movies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No movies found. Add some movies to get started.
                        </td>
                      </tr>
                    ) : (
                      movies.map((movie) => (
                        <tr key={movie.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={movie.poster_url || '/fallback-movie.png'}
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/fallback-movie.png';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{movie.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate whitespace-normal break-words" title={movie.description}>
                                  {movie.description.split(' ').length > 6
                                    ? movie.description.split(' ').slice(0, 6).join(' ') + '...'
                                    : movie.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(movie.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                onClick={() => handleEditMovie(movie)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={`Edit ${movie.title}`}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteMovie(movie)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={`Delete ${movie.title}`}
                                disabled={deletingMovie === movie.id}
                              >
                                {deletingMovie === movie.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Movie Modal */}
            {editingMovie && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Movie</h3>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      aria-label="Close edit form"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateMovie} className="space-y-4">
                    <div>
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Movie Title
                      </label>
                      <input
                        id="edit-title"
                        type="text"
                        value={editMovieForm.title}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        value={editMovieForm.description}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-poster" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Poster URL (optional)
                      </label>
                      <input
                        id="edit-poster"
                        type="text"
                        value={editMovieForm.poster_url}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, poster_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Duration in minutes (optional)
                      </label>
                      <input
                        id="edit-duration"
                        type="number"
                        value={editMovieForm.duration}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updatingMovie}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingMovie ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update Movie</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Shows Tab */}
        {activeTab === 'shows' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Add Show Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Show</h3>
              <form className="space-y-4" onSubmit={handleAddShow}>
                <div>
                  <label htmlFor="movie_id" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Movie</label>
                  <select
                    id="movie_id"
                    name="movie_id"
                    value={newShow.movie_id}
                    onChange={(e) => setNewShow({ ...newShow, movie_id: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select a movie</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>{movie.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="show_time" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Show Time</label>
                  <input
                    id="show_time"
                    type="datetime-local"
                    value={newShow.show_time}
                    onChange={(e) => setNewShow({ ...newShow, show_time: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Screen (e.g., Screen 1)"
                  value={newShow.screen}
                  onChange={(e) => setNewShow({ ...newShow, screen: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Add Show
                </button>
              </form>
            </div>

            {/* Shows List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Shows</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Movie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Show Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Screen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {shows.map((show) => (
                      <tr key={show.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {movies.find(m => m.id === show.movie_id)?.title || 'Unknown Movie'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(show.show_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {show.screen}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={() => handleEditShow(show)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`Edit show for ${movies.find(m => m.id === show.movie_id)?.title || 'Unknown Movie'}`}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteShow(show)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`Delete show for ${movies.find(m => m.id === show.movie_id)?.title || 'Unknown Movie'}`}
                              disabled={deletingShow === show.id}
                            >
                              {deletingShow === show.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Show Modal */}
            {editingShow && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Show</h3>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      aria-label="Close edit form"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateShow} className="space-y-4">
                    <div>
                      <label htmlFor="edit-show-movie" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Movie
                      </label>
                      <select
                        id="edit-show-movie"
                        value={editShowForm.movie_id}
                        onChange={(e) => setEditShowForm({ ...editShowForm, movie_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="" disabled>Select a movie</option>
                        {movies.map((movie) => (
                          <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-show-time" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Show Time
                      </label>
                      <input
                        id="edit-show-time"
                        type="datetime-local"
                        value={editShowForm.show_time}
                        onChange={(e) => setEditShowForm({ ...editShowForm, show_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-screen" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Screen
                      </label>
                      <input
                        id="edit-screen"
                        type="text"
                        value={editShowForm.screen}
                        onChange={(e) => setEditShowForm({ ...editShowForm, screen: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Screen 1"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updatingShow}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingShow ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update Show</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Movie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Show Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {booking.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {booking.movie_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(booking.show_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {booking.seat_numbers?.join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{booking.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.type && deleteConfirm.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 