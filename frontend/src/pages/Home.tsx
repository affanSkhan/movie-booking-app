import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder data for movies
const sampleMovies = [
  {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    language: 'English',
    duration: 148,
    poster_url: 'https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg',
  },
  {
    id: 2,
    title: 'Parasite',
    genre: 'Thriller',
    language: 'Korean',
    duration: 132,
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    id: 3,
    title: 'Interstellar',
    genre: 'Sci-Fi',
    language: 'English',
    duration: 169,
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  },
  {
    id: 4,
    title: '3 Idiots',
    genre: 'Comedy',
    language: 'Hindi',
    duration: 170,
    poster_url: 'https://image.tmdb.org/t/p/w500/66VbK5GqUoL1hFQ2y8bJ5yQ9gkR.jpg',
  },
  {
    id: 5,
    title: 'Joker',
    genre: 'Drama',
    language: 'English',
    duration: 122,
    poster_url: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
  },
  {
    id: 6,
    title: 'Dangal',
    genre: 'Drama',
    language: 'Hindi',
    duration: 161,
    poster_url: 'https://image.tmdb.org/t/p/w500/p2lVAcPuRPSO8Al6hDDGw0OgMi8.jpg',
  },
];

const genres = ['All', 'Sci-Fi', 'Thriller', 'Comedy', 'Drama'];
const languages = ['All', 'English', 'Hindi', 'Korean'];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [date, setDate] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtered movies
  const filteredMovies = sampleMovies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genre === 'All' || movie.genre === genre;
    const matchesLanguage = language === 'All' || movie.language === language;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Your Movie Experience
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the latest movies, reserve your favorite seats, and enjoy the ultimate cinematic experience with our modern booking platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/movies')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Browse Movies
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-white dark:bg-gray-800 shadow-md py-4 px-4 md:px-8 flex flex-col md:flex-row items-center gap-4 z-10">
        <input
          type="text"
          placeholder="Search movies..."
          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search movies"
        />
        <select
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={genre}
          onChange={e => setGenre(e.target.value)}
          aria-label="Filter by genre"
        >
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          aria-label="Filter by language"
        >
          {languages.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          type="date"
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={date}
          onChange={e => setDate(e.target.value)}
          aria-label="Filter by date"
        />
      </section>

      {/* Now Showing Section */}
      <section id="now-showing" className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Now Showing</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/movies')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View All Movies
              </button>
              <button
                aria-label="Scroll left"
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-blue-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => scrollNowShowing('left')}
              >
                <span aria-hidden>←</span>
              </button>
              <button
                aria-label="Scroll right"
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-blue-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => scrollNowShowing('right')}
              >
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
            tabIndex={0}
            aria-label="Now Showing Movies"
          >
            {filteredMovies.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-lg py-12 w-full text-center">No movies found.</div>
            ) : (
              filteredMovies.map((movie, idx) => (
                <motion.div
                  key={movie.id}
                  className="min-w-[220px] max-w-xs snap-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full group">
                    <img
                      src={movie.poster_url}
                      alt={movie.title + ' poster'}
                      className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{movie.title}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {movie.genre} • {movie.language} • {movie.duration} min
                      </div>
                      <button
                        className="mt-auto px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all relative overflow-hidden group"
                        onClick={() => navigate(`/showtimes/${movie.id}`)}
                        aria-label={`Book ${movie.title}`}
                      >
                        <span className="relative z-10">Book Now</span>
                        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-30 blur-lg transition-all duration-300"></span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl mb-3">🎥</span>
              <span className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Real-Time Seat Selection</span>
              <span className="text-gray-500 dark:text-gray-400">See seat availability live and book instantly.</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl mb-3">💳</span>
              <span className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Secure Razorpay Payments</span>
              <span className="text-gray-500 dark:text-gray-400">Pay safely with trusted payment gateway.</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl mb-3">🕓</span>
              <span className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Instant Booking Confirmation</span>
              <span className="text-gray-500 dark:text-gray-400">Get your tickets confirmed in seconds.</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl mb-3">👨‍💻</span>
              <span className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Admin Panel for Management</span>
              <span className="text-gray-500 dark:text-gray-400">Easily manage movies, shows, and bookings.</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">About</h3>
            <p className="text-gray-400 text-sm">A modern movie booking platform with real-time seat selection, secure payments, and instant confirmation.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Contact</h3>
            <p className="text-gray-400 text-sm">Email: support@movietheater.com</p>
            <p className="text-gray-400 text-sm">Phone: +1 234 567 890</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">FAQs</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>How do I book a ticket?</li>
              <li>Can I cancel my booking?</li>
              <li>How do I contact support?</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Terms</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="hover:text-blue-400"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.92 4.92 0 0 0 16.616 3c-2.73 0-4.942 2.21-4.942 4.932 0 .386.045.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.237-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg></a>
              <a href="#" aria-label="Facebook" className="hover:text-blue-600"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
              <a href="#" aria-label="Instagram" className="hover:text-pink-400"><svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C21.449.425 20.276.131 19 .072 17.72.013 17.311 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">&copy; {new Date().getFullYear()} Movie Theater Booking. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home; 