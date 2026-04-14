import axios from 'axios';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
// Android Emulator  → http://10.0.2.2:3000
// iOS Simulator/Web → http://localhost:3000
// Physical Device   → set EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000
// ─────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Log every request and response for debugging
api.interceptors.request.use(req => {
  console.log(`📤 ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
  if (req.data) console.log('📦 Body:', JSON.stringify(req.data));
  return req;
});

api.interceptors.response.use(
  res => {
    console.log(`✅ ${res.status}:`, JSON.stringify(res.data).slice(0, 100));
    return res;
  },
  err => {
    console.log('❌ Error:', err.message);
    console.log('❌ Code:', err.code);
    if (err.response) console.log('❌ Response:', JSON.stringify(err.response.data));
    return Promise.reject(err);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const registerUser     = (data) => api.post('/api/auth/register', data);
export const loginUser        = (data) => api.post('/api/auth/login', data);
export const getProfile       = ()     => api.get('/api/user/profile');
export const updateProfile    = (data) => api.put('/api/user/profile', data);
export const getReminders     = ()     => api.get('/api/reminders');
export const createReminder   = (data) => api.post('/api/reminders', data);
export const completeReminder = (id)   => api.put(`/api/reminders/${id}/complete`);
export const deleteReminder   = (id)   => api.delete(`/api/reminders/${id}`);

export default api;
