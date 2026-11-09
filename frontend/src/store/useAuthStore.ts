import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaffOrAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

// Khởi tạo trạng thái đăng nhập đồng bộ ngay khi load module
const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('autobot_token');
    const userStr = localStorage.getItem('autobot_user');
    if (token && userStr) {
      const user: User = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isStaffOrAdmin: user.role === 'ADMIN' || user.role === 'STAFF',
      };
    }
  } catch {
    localStorage.removeItem('autobot_token');
    localStorage.removeItem('autobot_user');
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isStaffOrAdmin: false,
  };
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialAuth,

  setAuth: (user, token) => {
    localStorage.setItem('autobot_token', token);
    localStorage.setItem('autobot_user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isStaffOrAdmin: user.role === 'ADMIN' || user.role === 'STAFF',
    });
  },

  logout: () => {
    localStorage.removeItem('autobot_token');
    localStorage.removeItem('autobot_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isStaffOrAdmin: false,
    });
  },

  loadFromStorage: () => {
    const fresh = getInitialAuth();
    set(fresh);
  },
}));
