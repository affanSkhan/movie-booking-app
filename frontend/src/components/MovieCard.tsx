import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    description: string;
    poster_url?: string;
    duration?: number;
  };
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden card-hover"
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
        <img
          src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Movie'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-2xl animate-bounce-in">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration badge */}
        {movie.duration && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
          <span className="text-xs text-white font-medium">
            {(Math.random() * 2 + 3).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {movie.description}
        </p>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/movie/${movie.id}`}
            className="flex-1 btn-primary text-center text-sm py-2"
          >
            View Details
          </Link>
          <Link
            to={`/showtimes?movie=${movie.id}`}
            className="flex-1 btn-secondary text-center text-sm py-2"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/50 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default MovieCard; 