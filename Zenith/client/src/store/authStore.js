import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('zenith_token'),
  loading: true,
  error: null,

  init: async () => {
    const token = localStorage.getItem('zenith_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.get('/auth/me');
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('zenith_token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    const { token, user } = await api.post('/auth/login', { email, password });
    localStorage.setItem('zenith_token', token);
    set({ token, user });
    return user;
  },

  register: async (username, email, password) => {
    set({ error: null });
    const { token, user } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('zenith_token', token);
    set({ token, user });
    return user;
  },

  logout: () => {
    localStorage.removeItem('zenith_token');
    set({ user: null, token: null });
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },
}));

export default useAuthStore;
