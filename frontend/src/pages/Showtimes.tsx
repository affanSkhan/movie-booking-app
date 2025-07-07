import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { moviesAPI, showsAPI } from '../services/api';
import { Clock, Calendar, MapPin, Users, Film } from 'lucide-react';

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
  movie?: Movie;
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
      try {
        setLoading(true);
        
        if (movieId) {
          // Fetch showtimes for specific movie
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
        } else {
          // Fetch all shows for all movies
          const showsResponse = await showsAPI.getAll();
          
          // Add mock availability data and fetch movie data for each show
          const showsWithAvailability: ShowWithAvailability[] = await Promise.all(
            showsResponse.data.map(async (show: Show) => {
              const totalSeats = 40; // Mock total seats
              const bookedSeats = Math.floor(Math.random() * 35); // Mock booked seats
              const availableSeats = totalSeats - bookedSeats;
              
              let status: ShowWithAvailability['status'] = 'available';
              if (availableSeats === 0) status = 'sold-out';
              else if (availableSeats <= 5) status = 'almost-full';
              else if (availableSeats <= 15) status = 'filling-fast';
              
              // Fetch movie data for this show
              let movieData: Movie | null = null;
              try {
                const movieResponse = await moviesAPI.getById(show.movie_id.toString());
                movieData = movieResponse.data;
              } catch (err) {
                console.error('Error fetching movie data:', err);
              }
              
              return {
                ...show,
                availableSeats,
                totalSeats,
                status,
                movie: movieData
              };
            })
          );
          
          setShows(showsWithAvailability);
        }
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
          <p className="text-muted-foreground text-lg">Loading showtimes...</p>
        </motion.div>
      </div>
    );
  }

  if (error || (movieId && !movie)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center bg-card border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || 'Movie not found'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 mt-16">
      {/* Enhanced Header with Movie Banner */}
      <header className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Movie Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {movie ? (
              <>
                {/* Enhanced Movie Poster */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={movie.poster_url || 'https://via.placeholder.com/120x180/1f2937/ffffff?text=No+Poster'}
                      alt={movie.title}
                      className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-2xl shadow-lg border border-border/50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/120x180/1f2937/ffffff?text=No+Poster';
                      }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                {/* Enhanced Movie Details */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {movie.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {movie.duration && (
                      <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" />
                        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                      <Calendar className="w-4 h-4" />
                      Action • Drama
                    </div>
                    <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                      <MapPin className="w-4 h-4" />
                      English
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {movie.description || 'No description available.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  All Showtimes
                </h1>
                <p className="text-muted-foreground text-lg">
                  Browse all available movie showtimes and book your perfect seats
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Enhanced Filters */}
      <section className="relative -mt-4 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="backdrop-blur-xl bg-card/80 dark:bg-card/90 border border-border/50 rounded-2xl shadow-soft-dark p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Enhanced Date Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">Filter by Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  aria-label="Select a date to filter showtimes"
                  className="w-full px-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm cursor-pointer"
                />
              </div>

              {/* Enhanced Sort */}
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-foreground mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'time' | 'screen')}
                  aria-label="Sort showtimes by time or screen"
                  className="w-full px-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="time">Time</option>
                  <option value="screen">Screen</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Showtimes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.keys(filteredGroupedShows).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-12 backdrop-blur-sm">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No showtimes found</h3>
              <p className="text-muted-foreground text-lg">Try selecting a different date or check back later</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGroupedShows).map(([date, dateShows], dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm"
              >
                {/* Enhanced Date Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{date}</h2>
                      <p className="text-primary-foreground/80 text-sm">{dateShows.length} showtime{dateShows.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Shows Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                              y: -4,
                              transition: { duration: 0.2 }
                            }}
                            className="group relative bg-background/50 dark:bg-background/30 rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                          >
                            {/* Enhanced Show Time */}
                            <div className="text-center mb-4">
                              <div className="text-3xl font-bold text-foreground mb-1">
                                {formatShowTime(show.show_time)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(show.show_time).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>

                            {/* Show Movie Info when displaying all showtimes */}
                            {!movieId && show.movie && (
                              <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                  <img
                                    src={show.movie.poster_url || 'https://via.placeholder.com/40x60/1f2937/ffffff?text=No+Poster'}
                                    alt={show.movie.title}
                                    className="w-10 h-15 object-cover rounded-lg shadow-sm"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/40x60/1f2937/ffffff?text=No+Poster';
                                    }}
                                  />
                                  <div className="text-left">
                                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                                      {show.movie.title}
                                    </h3>
                                    {show.movie.duration && (
                                      <p className="text-xs text-muted-foreground">
                                        {Math.floor(show.movie.duration / 60)}h {show.movie.duration % 60}m
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Enhanced Screen Info */}
                            <div className="text-center mb-4">
                              <div className="text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-full inline-block">
                                Screen {show.screen}
                              </div>
                            </div>

                            {/* Enhanced Availability */}
                            <div className="text-center mb-6">
                              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                                <Users className="w-4 h-4" />
                                {show.availableSeats} of {show.totalSeats} seats available
                              </div>
                              
                              {/* Enhanced Status Badge */}
                              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium border ${statusStyle}`}>
                                {statusLabel}
                              </span>
                            </div>

                            {/* Enhanced CTA Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={show.status === 'sold-out'}
                              onClick={() => navigate(`/booking/${show.id}`)}
                              className={`w-full py-3 px-4 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                                show.status === 'sold-out'
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed focus:ring-muted'
                                  : 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary'
                              }`}
                            >
                              {show.status === 'sold-out' ? 'Sold Out' : 'Select Seats'}
                            </motion.button>

                            {/* Enhanced hover effect border */}
                            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
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