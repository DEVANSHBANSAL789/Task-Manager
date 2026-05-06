import axios from 'axios';

// 1. Smartly choose between Railway URL and Localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create the Axios instance using that smart URL
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// 3. Your Interceptor (Attaches the token to every request)
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
