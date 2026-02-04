import axios from 'axios';

// Configure axios defaults
// In development, use localhost backend
// In production, use the specific backend URL
const baseURL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://awltaskmanger.onrender.com'
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