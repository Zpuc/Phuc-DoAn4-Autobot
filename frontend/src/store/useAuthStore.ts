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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isStaffOrAdmin: false,

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
    const token = localStorage.getItem('autobot_token');
    const userStr = localStorage.getItem('autobot_user');
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isStaffOrAdmin: user.role === 'ADMIN' || user.role === 'STAFF',
        });
      } catch {
        get().logout();
      }
    }
  },
}));

