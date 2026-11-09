import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tự động gắn token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autobot_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest && localStorage.getItem('autobot_token')) {
        localStorage.removeItem('autobot_token');
        localStorage.removeItem('autobot_user');
      }
    }
    const message =
      error.response?.data?.message || error.message || 'Đã có lỗi xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

