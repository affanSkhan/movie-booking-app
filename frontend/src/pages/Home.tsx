import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Play, Clock, Sparkles, Zap, Shield } from 'lucide-react';
import { moviesAPI } from '../services/api';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
  created_at: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [date, setDate] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await moviesAPI.getAll();
        setMovies(response.data);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Get unique genres and languages from movies
  const genres = ['All', ...Array.from(new Set(movies.map(movie => movie.description?.split(' ')[0] || 'Other').filter(Boolean)))];
  const languages = ['All', ...Array.from(new Set(movies.map(movie => movie.description?.split(' ').slice(-1)[0] || 'Other').filter(Boolean)))];

  // Filtered movies
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase()) ||
                         movie.description?.toLowerCase().includes(search.toLowerCase());
    const movieGenre = movie.description?.split(' ')[0] || 'Other';
    const movieLanguage = movie.description?.split(' ').slice(-1)[0] || 'Other';
    const matchesGenre = genre === 'All' || movieGenre === genre;
    const matchesLanguage = language === 'All' || movieLanguage === language;
    return matchesSearch && matchesGenre && matchesLanguage;
  });

  // Scroll Now Showing horizontally
  const scrollNowShowing = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -320 : 320,
        behavior: 'smooth',
      });
    }
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Enhanced background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 dark:from-primary/30 dark:via-primary/20 dark:to-accent/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20"></div>
        
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/25">
                  <Play className="w-12 h-12 text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Experience
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Cinema Magic
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl mb-10 text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Discover the latest blockbusters, reserve your perfect seats, and immerse yourself in the ultimate cinematic experience.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/movies')}
                className="group relative px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg shadow-lg shadow-primary/25 transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Browse Movies
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/showtimes')}
                className="group relative px-8 py-4 bg-card hover:bg-card/80 text-card-foreground border border-border rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  View Showtimes
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-muted/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Search & Filter Bar */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="backdrop-blur-xl bg-card/80 dark:bg-card/90 border border-border/50 rounded-2xl shadow-soft-dark p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Enhanced Search Input */}
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search movies"
                />
              </div>

              {/* Enhanced Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative group">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <select
                    className="pl-10 pr-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    aria-label="Filter by genre"
                  >
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <select
                    className="pl-10 pr-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    aria-label="Filter by language"
                  >
                    {languages.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="date"
                  className="px-4 py-3 bg-background/50 dark:bg-background/30 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 backdrop-blur-sm cursor-pointer"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  aria-label="Filter by date"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Now Showing Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Now Showing
              </h2>
              <p className="text-muted-foreground text-lg">
                Catch the latest blockbusters on the big screen
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/movies')}
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-3 py-2"
              >
                View All Movies
              </motion.button>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Scroll left"
                  className="p-3 rounded-xl bg-card hover:bg-card/80 border border-border/50 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  onClick={() => scrollNowShowing('left')}
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Scroll right"
                  className="p-3 rounded-xl bg-card hover:bg-card/80 border border-border/50 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  onClick={() => scrollNowShowing('right')}
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory"
            tabIndex={0}
            aria-label="Now Showing Movies"
          >
            {filteredMovies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-lg py-12 w-full text-center"
              >
                No movies found matching your criteria.
              </motion.div>
            ) : (
              filteredMovies.map((movie, idx) => (
                <motion.div
                  key={movie.id}
                  className="min-w-[280px] max-w-xs snap-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {/* Enhanced Movie Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl">
                      <img
                        src={movie.poster_url || 'https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Poster'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Poster';
                        }}
                      />
                      
                      {/* Enhanced overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Enhanced Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div 
                          className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                        </motion.div>
                      </div>

                      {/* Enhanced Duration badge */}
                      <div className="absolute top-3 right-3 backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 px-3 py-1.5 rounded-full flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">
                          {formatDuration(movie.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Movie Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                        {movie.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                          {movie.description?.split(' ')[0] || 'Movie'}
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-medium">
                          {movie.description?.split(' ').slice(-1)[0] || 'English'}
                        </span>
                      </div>
                      
                      {/* Enhanced Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/showtimes/${movie.id}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center text-sm py-2.5 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                      >
                        Book Now
                      </motion.button>
                    </div>

                    {/* Enhanced hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us Section */}
      <section className="py-16 sm:py-20 bg-muted/30 dark:bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose MovieBook?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of movie booking with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Latest Movies',
                description: 'Access to the newest releases and classic favorites with real-time updates'
              },
              {
                icon: Shield,
                title: 'Smart Seating',
                description: 'Interactive seat selection with real-time availability and instant confirmation'
              },
              {
                icon: Zap,
                title: 'Secure Payments',
                description: 'Safe and convenient payment options with industry-standard encryption'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative bg-card border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-card border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MovieBook</h3>
              <p className="text-muted-foreground">
                Your ultimate destination for movie booking and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Movies</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Showtimes</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">My Bookings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors duration-200">
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.164c-.951.555-2.197.959-3.427 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.42-.014-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors duration-200">
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.592 1.323-1.326V1.326C24 .592 23.405 0 22.675 0z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors duration-200">
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.85.77 1.266.456 2.35 1.08 3.434 2.164 1.084 1.084 1.708 2.168 2.164 3.434.436 1.217.708 2.484.77 3.85.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-.77 3.85-.456 1.266-1.08 2.35-2.164 3.434-1.084 1.084-2.168 1.708-3.434 2.164-1.217.436-2.484.708-3.85.77-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.85-.77-1.266-.456-2.35-1.08-3.434-2.164-1.084-1.084-1.708-2.168-2.164-3.434-.436-1.217-.708-2.484-.77-3.85-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633.77-3.85.456-1.266 1.08-2.35 2.164-3.434 1.084-1.084 2.168-1.708 3.434-2.164 1.217-.436 2.484-.708 3.85-.77 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.653.363 3.678.678c-.975.315-1.797.74-2.62 1.563C.74 3.063.315 3.885 0 4.86c-.315.975-.547 2.093-.606 3.374C-.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.281.291 2.399.606 3.374.315.975.74 1.797 1.563 2.62.823.823 1.645 1.248 2.62 1.563.975.315 2.093.547 3.374.606C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.399-.291 3.374-.606.975-.315 1.797-.74 2.62-1.563.823-.823 1.248-1.645 1.563-2.62.315-.975.547-2.093.606-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.291-2.399-.606-3.374-.315-.975-.74-1.797-1.563-2.62C21.797.74 20.975.315 20 .001c-.975-.315-2.093-.547-3.374-.606C15.668.013 15.259 0 12 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MovieBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 