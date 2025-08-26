import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 406) {
      localStorage.removeItem('workshop_user');
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  me: () =>
    api.get('/api/auth/me'),
};

// Admin API
export const adminAPI = {
  check: () =>
    api.get('/api/admin/check'),
  
  addAdmin: (adminData: {
    email: string;
    name: string;
    password: string;
    showroomId?: string;
    phone?: string;
  }) =>
    api.post('/api/admin/admins', adminData),
};

export default api;
