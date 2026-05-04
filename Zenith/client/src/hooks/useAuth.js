import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const { user, token, loading, error, login, register, logout, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  return { user, token, loading, error, login, register, logout, isAuthenticated: !!user };
}
