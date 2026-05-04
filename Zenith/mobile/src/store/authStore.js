import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  init: async () => {
    try {
      const token = await AsyncStorage.getItem('@zenith_token');
      if (token) {
        const user = await api.get('/auth/me');
        set({ user, token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      await AsyncStorage.removeItem('@zenith_token');
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('@zenith_token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (username, email, password) => {
    const data = await api.post('/auth/register', { username, email, password });
    await AsyncStorage.setItem('@zenith_token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('@zenith_token');
    set({ user: null, token: null });
  },

  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}));

export default useAuthStore;
