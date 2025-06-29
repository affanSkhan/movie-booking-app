import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { moviesAPI, showsAPI } from '../services/api';
import { Clock, Star, Search, Filter, Calendar, Sparkles, Zap, Film } from 'lucide-react';

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
}

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'newest'>('newest');

  // Fetch movies and shows
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesResponse, showsResponse] = await Promise.all([
          moviesAPI.getAll(),
          showsAPI.getByMovie('all')
        ]);
        
        setMovies(moviesResponse.data);
        setShows(showsResponse.data);
      } catch (err) {
        setError('Failed to load movies. Please try again.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get shows count for a movie
  const getShowsCount = (movieId: number) => {
    return shows.filter(show => show.movie_id === movieId).length;
  };

  // Filter and sort movies
  const filteredMovies = movies
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase()) ||
                           movie.description?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          <p className="text-muted-foreground text-lg">Loading movies...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
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
          <p className="text-muted-foreground mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 mt-16">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Now Showing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover and book your favorite movies with our curated collection
            </p>
          </motion.div>
        </div>
      </header>

      {/* Enhanced Search and Filters */}
      <section className="relative -mt-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="backdrop-blur-xl bg-card/80 dark:bg-card/90 border border-border/50 rounded-2xl shadow-soft-dark p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Enhanced Search */}
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search movies by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              {/* Enhanced Date Filter */}
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="pl-10 pr-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm cursor-pointer"
                  aria-label="Filter by date"
                />
              </div>

              {/* Enhanced Sort */}
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'title' | 'duration' | 'newest')}
                  className="pl-10 pr-8 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                  aria-label="Sort movies by"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Movies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-12 backdrop-blur-sm">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No movies found</h3>
              <p className="text-muted-foreground text-lg">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/showtimes/${movie.id}`)}
                >
                  <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Enhanced Poster */}
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <img
                        src={movie.poster_url || 'https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Poster'}
                        alt={movie.title}
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Poster';
                        }}
                      />
                      
                      {/* Enhanced overlay with show count */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 rounded-xl p-4">
                            <p className="text-sm font-medium text-white flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              {getShowsCount(movie.id)} showtimes available
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Duration badge */}
                      {movie.duration && (
                        <div className="absolute top-3 right-3 backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white" />
                          <span className="text-white">{formatDuration(movie.duration)}</span>
                        </div>
                      )}

                      {/* Enhanced Rating badge */}
                      <div className="absolute top-3 left-3 backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-white">4.5</span>
                      </div>
                    </div>

                    {/* Enhanced Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {movie.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                        {movie.description || 'No description available.'}
                      </p>

                      {/* Enhanced Movie details */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
                        <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">Action • Drama</span>
                        <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-medium">English</span>
                      </div>

                      {/* Enhanced CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/showtimes/${movie.id}`);
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        Book Now
                      </motion.button>
                    </div>

                    {/* Enhanced hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Enhanced Results count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.p 
          className="text-muted-foreground text-sm bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Showing {filteredMovies.length} of {movies.length} movies
        </motion.p>
      </div>
    </div>
  );
};

export default Movies; 