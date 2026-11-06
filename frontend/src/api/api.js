import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected, clear it and go to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthCall = /\/auth\/(student-)?login/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthCall && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = window.location.pathname.startsWith('/admin') ? '/login' : '/student-login';
    }
    return Promise.reject(error);
  }
);

export const getError = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';

export default api;
