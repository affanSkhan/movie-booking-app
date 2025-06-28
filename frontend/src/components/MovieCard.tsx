import React from 'react';
import { Link } from 'react-router-dom';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
  created_at: string;
}

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const defaultPoster = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Poster';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={movie.poster_url || defaultPoster}
          alt={movie.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultPoster;
          }}
        />
        {movie.duration && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {movie.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {movie.description || 'No description available.'}
        </p>
        
        <Link
          to={`/movie/${movie.id}`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default MovieCard; 