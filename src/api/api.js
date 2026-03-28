import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your Node.js server IP
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
api.interceptors.request.use(config => {
  // const token = await AsyncStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Example endpoints (wire these up when backend is ready):
// POST   /api/auth/login
// POST   /api/auth/register
// GET    /api/reminders
// POST   /api/reminders
// PUT    /api/reminders/:id
// DELETE /api/reminders/:id
// GET    /api/profile
// PUT    /api/profile
