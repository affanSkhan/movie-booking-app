// // This file is unused. The /movie/:id route and MovieDetails component are commented out in App.tsx. Use Movies and Showtimes instead.

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { moviesAPI, showsAPI } from '../services/api';

// interface Movie {
//   id: number;
//   title: string;
//   description: string;
//   poster_url?: string;
//   duration?: number;
//   created_at: string;
// }

// interface Show {
//   id: number;
//   movie_id: number;
//   show_time: string;
//   screen: string;
//   created_at: string;
// }

// const MovieDetails: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [movie, setMovie] = useState<Movie | null>(null);
//   const [shows, setShows] = useState<Show[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchMovieDetails = async () => {
//       if (!id) return;

//       try {
//         setLoading(true);
//         const [movieResponse, showsResponse] = await Promise.all([
//           moviesAPI.getById(id),
//           showsAPI.getByMovie(id),
//         ]);

//         setMovie(movieResponse.data);
//         setShows(showsResponse.data);
//       } catch (err) {
//         console.error('Error fetching movie details:', err);
//         setError('Failed to load movie details. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovieDetails();
//   }, [id]);

//   const formatShowTime = (showTime: string) => {
//     const date = new Date(showTime);
//     return {
//       date: date.toLocaleDateString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       }),
//       time: date.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//     };
//   };

//   const handleShowSelect = (showId: number) => {
//     navigate(`/booking/${showId}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600 dark:text-gray-400">Loading movie details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !movie) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-6xl mb-4">⚠️</div>
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Oops!</h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Movie not found'}</p>
//           <button
//             onClick={() => navigate('/')}
//             className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
//           >
//             Back to Movies
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const defaultPoster = 'https://via.placeholder.com/400x600/1f2937/ffffff?text=No+Poster';

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
//           <div className="md:flex">
//             {/* Movie Poster */}
//             <div className="md:w-1/3">
//               <img
//                 src={movie.poster_url || defaultPoster}
//                 alt={movie.title}
//                 className="w-full h-96 md:h-full object-cover"
//                 onError={(e) => {
//                   const target = e.target as HTMLImageElement;
//                   target.src = defaultPoster;
//                 }}
//               />
//             </div>

//             {/* Movie Details */}
//             <div className="md:w-2/3 p-6">
//               <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//                   {movie.title}
//                 </h1>
                
//                 {movie.duration && (
//                   <p className="text-gray-600 dark:text-gray-400 mb-4">
//                     Duration: {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
//                   </p>
//                 )}

//                 <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                   {movie.description || 'No description available.'}
//                 </p>
//               </div>

//               {/* Showtimes */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                   🎭 Available Showtimes
//                 </h2>

//                 {shows.length === 0 ? (
//                   <div className="text-center py-8">
//                     <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🎭</div>
//                     <p className="text-gray-600 dark:text-gray-400">No showtimes available for this movie.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {shows.map((show) => {
//                       const { date, time } = formatShowTime(show.show_time);
//                       return (
//                         <div
//                           key={show.id}
//                           className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer bg-gray-50 dark:bg-gray-700"
//                           onClick={() => handleShowSelect(show.id)}
//                         >
//                           <div className="text-center">
//                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{date}</p>
//                             <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                               {time}
//                             </p>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                               Screen {show.screen}
//                             </p>
//                             <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
//                               Select Seats
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails; 