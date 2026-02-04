import axios from 'axios';

// Configure axios defaults
// In development, let the proxy handle routing to the backend
// In production, use the API URL or current origin
const baseURL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || window.location.origin
  : 'http://localhost:5002'; // Keep your local development port

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;