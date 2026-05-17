import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('webmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendData = error.response?.data;
    const url = error.config?.url || '';
    const config = error.config;
    const getErrorMessage = () => {
      if (typeof backendData === 'string') return backendData;
      return backendData?.message || backendData?.error || 'Something went wrong';
    };
    if (!error.response) {
      console.error("🚀 WebMart Backend Down or Unreachable.");
      return Promise.reject(error);
    }

    switch (status) {
      case 400: 
        toast.error(getErrorMessage());
        break;

      case 401:
        if (!url.includes('/auth/login')) {
          console.warn("Session Expired: Clearing Storage");
          localStorage.removeItem('webmart_token');
          localStorage.removeItem('webmart_user');
          toast.error('Session expired. Please login again.');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        break;

      case 403:
        const isDashboardRoute = url.includes('/admin') || url.includes('/seller') || url.includes('/products');
        const isAuthRoute = url.includes('/auth/');

        if (!isDashboardRoute && !isAuthRoute) {
          toast.error('Access Denied: You do not have permission.');
        } else {
          console.warn(`Silent 403 on: ${url} - Handled by UI Logic`);
        }
        break;

      case 404:
        const isSilent404 = config.method === 'get' && url.includes('/products');
        if (!isSilent404) {
          toast.error(getErrorMessage() || 'Resource not found');
        }
        break;

      case 410:
        break;

      case 500:
        console.error("Internal Server Error at:", url);
        toast.error('Server error. Please try again later.');
        break;

      default:
        if (status && status > 500) {
          toast.error('Server is under maintenance.');
        }
    }

    return Promise.reject(error);
  }
);

export default api;