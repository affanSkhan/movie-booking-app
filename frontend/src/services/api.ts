import axios from 'axios';

// Always ensure /api is included in the base URL
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  adminLogin: (data: { email: string; password: string }) =>
    api.post('/auth/admin-login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Movies API
export const moviesAPI = {
  getAll: () => api.get('/movies'),
  getById: (id: string) => api.get(`/movies/${id}`),
  create: (data: { title: string; description: string; poster_url?: string; duration?: number }) =>
    api.post('/movies', data),
  update: (id: string, data: { title?: string; description?: string; poster_url?: string; duration?: number }) => 
    api.put(`/movies/${id}`, data),
  delete: (id: string) => api.delete(`/movies/${id}`),
};

// Shows API
export const showsAPI = {
  getAll: () => api.get('/shows/movie/all'),
  getByMovie: (movieId: string) => api.get(`/shows/movie/${movieId}`),
  getById: (id: string) => api.get(`/shows/${id}`),
  create: (data: { movie_id: number; show_time: string; screen: string }) =>
    api.post('/shows', data),
  update: (id: string, data: { movie_id?: number; show_time?: string; screen?: string }) => 
    api.put(`/shows/${id}`, data),
  delete: (id: string) => api.delete(`/shows/${id}`),
};

// Seats API
export const seatsAPI = {
  getByShow: (showId: string) => api.get(`/seats/show/${showId}`),
  select: (data: { showId: string; seatNumber: string }) =>
    api.post('/seats/select', data),
  deselect: (data: { showId: string; seatNumber: string }) =>
    api.post('/seats/deselect', data),
  createForShow: (data: { showId: string; rows?: number; columns?: number }) =>
    api.post('/seats/create', data),
  cleanup: () => api.post('/seats/cleanup'),
};

// Bookings API
export const bookingsAPI = {
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: () => api.get('/bookings'),
  createOrder: (data: { showId: string; seatNumbers: string[] }) =>
    api.post('/bookings/create-order', data),
  confirm: (data: { showId: string; seatNumbers: string[]; paymentId: string; orderId: string }) =>
    api.post('/bookings/confirm', data),
  cancel: (bookingId: string) => api.post(`/bookings/${bookingId}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
};

// Payment API
export const paymentAPI = {
  createOrder: (data: { amount: number; currency?: string }) =>
    api.post('/payment/create-order', data),
  verifyPayment: (data: { paymentId: string; orderId: string; signature: string }) =>
    api.post('/payment/verify', data),
};

export default api;