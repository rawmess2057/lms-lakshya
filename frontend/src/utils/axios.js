import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
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

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 429 (Too Many Requests) errors
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      // For video progress updates, silently fail (they're not critical)
      if (error.config?.url?.includes('/videos/') && error.config?.url?.includes('/progress')) {
        return Promise.reject(error); // Silently fail for video progress
      }
      // For other requests, show a user-friendly message
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error(`Too many requests. Please wait ${retryAfter} seconds before trying again.`);
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || '';
      
      // Handle token expiry
      if (error.response?.status === 401 && (errorMessage.includes('expired') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/login/student' && window.location.pathname !== '/login/teacher') {
          // Use toast if available, otherwise alert
          if (typeof window !== 'undefined' && window.toast) {
            window.toast.error('Your session has expired. Please login again.');
          } else {
            alert('Your session has expired. Please login again.');
          }
        }
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // If user is blocked, log them out
      if (errorMessage.includes('blocked') || errorMessage.includes('deactivated')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Show toast if available
        if (window.location.pathname !== '/login') {
          if (typeof window !== 'undefined' && window.toast) {
            window.toast.error('Your account has been blocked. You have been logged out.');
          } else {
            alert('Your account has been blocked. You have been logged out.');
          }
        }
        window.location.href = '/login';
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

