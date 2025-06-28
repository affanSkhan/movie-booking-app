import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { moviesAPI, showsAPI } from '../services/api';
import { Clock, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';

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

interface ShowWithAvailability extends Show {
  availableSeats: number;
  totalSeats: number;
  status: 'available' | 'filling-fast' | 'almost-full' | 'sold-out';
}

const Showtimes: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<ShowWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'screen'>('time');

  // Fetch movie and shows data
  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const [movieResponse, showsResponse] = await Promise.all([
          moviesAPI.getById(movieId),
          showsAPI.getByMovie(movieId)
        ]);
        
        setMovie(movieResponse.data);
        
        // Add mock availability data (in real app, this would come from seats API)
        const showsWithAvailability: ShowWithAvailability[] = showsResponse.data.map((show: Show) => {
          const totalSeats = 40; // Mock total seats
          const bookedSeats = Math.floor(Math.random() * 35); // Mock booked seats
          const availableSeats = totalSeats - bookedSeats;
          
          let status: ShowWithAvailability['status'] = 'available';
          if (availableSeats === 0) status = 'sold-out';
          else if (availableSeats <= 5) status = 'almost-full';
          else if (availableSeats <= 15) status = 'filling-fast';
          
          return {
            ...show,
            availableSeats,
            totalSeats,
            status
          };
        });
        
        setShows(showsWithAvailability);
      } catch (err) {
        setError('Failed to load showtimes. Please try again.');
        console.error('Error fetching showtimes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  // Group shows by date
  const groupedShows = shows.reduce((acc, show) => {
    const date = new Date(show.show_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(show);
    return acc;
  }, {} as Record<string, ShowWithAvailability[]>);

  // Sort shows within each date group
  Object.keys(groupedShows).forEach(date => {
    groupedShows[date].sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(a.show_time).getTime() - new Date(b.show_time).getTime();
      } else {
        return a.screen.localeCompare(b.screen);
      }
    });
  });

  // Filter by selected date
  const filteredGroupedShows = selectedDate 
    ? Object.fromEntries(
        Object.entries(groupedShows).filter(() => {
          const showDate = new Date(Object.values(groupedShows)[0][0]?.show_time || '');
          const selected = new Date(selectedDate);
          return showDate.toDateString() === selected.toDateString();
        })
      )
    : groupedShows;

  // Format show time
  const formatShowTime = (showTime: string) => {
    return new Date(showTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: ShowWithAvailability['status']) => {
    const styles = {
      'available': 'bg-green-100 text-green-800 border-green-200',
      'filling-fast': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'almost-full': 'bg-orange-100 text-orange-800 border-orange-200',
      'sold-out': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      'available': 'Available',
      'filling-fast': 'Filling Fast',
      'almost-full': 'Almost Full',
      'sold-out': 'Sold Out'
    };
    
    return { style: styles[status], label: labels[status] };
  };

  // Get today's date for date picker
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading showtimes...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate('/movies')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Movie Banner */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/movies')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </motion.button>

          {/* Movie Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster_url || 'https://via.placeholder.com/120x180/1f2937/ffffff?text=No+Poster'}
                alt={movie.title}
                className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/120x180/1f2937/ffffff?text=No+Poster';
                }}
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                {movie.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Action • Drama
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  English
                </div>
              </div>

              <p className="text-gray-700 text-sm line-clamp-2">
                {movie.description || 'No description available.'}
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'screen')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="time">Time</option>
                <option value="screen">Screen</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.keys(filteredGroupedShows).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No showtimes found</h3>
            <p className="text-gray-600">Try selecting a different date or check back later</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGroupedShows).map(([date, dateShows], dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Date Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <p className="text-blue-100 text-sm">{dateShows.length} showtime{dateShows.length !== 1 ? 's' : ''} available</p>
                </div>

                {/* Shows Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {dateShows.map((show, showIndex) => {
                        const { style: statusStyle, label: statusLabel } = getStatusBadge(show.status);
                        
                        return (
                          <motion.div
                            key={show.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: showIndex * 0.1 }}
                            whileHover={{ 
                              y: -2,
                              transition: { duration: 0.2 }
                            }}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                          >
                            {/* Show Time */}
                            <div className="text-center mb-3">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatShowTime(show.show_time)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(show.show_time).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>

                            {/* Screen Info */}
                            <div className="text-center mb-3">
                              <div className="text-sm font-medium text-gray-700">
                                Screen {show.screen}
                              </div>
                            </div>

                            {/* Availability */}
                            <div className="text-center mb-4">
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                                <Users className="w-4 h-4" />
                                {show.availableSeats} of {show.totalSeats} seats available
                              </div>
                              
                              {/* Status Badge */}
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${statusStyle}`}>
                                {statusLabel}
                              </span>
                            </div>

                            {/* CTA Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={show.status === 'sold-out'}
                              onClick={() => navigate(`/book/${show.id}`)}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                show.status === 'sold-out'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {show.status === 'sold-out' ? 'Sold Out' : 'Select Seats'}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Showtimes; 