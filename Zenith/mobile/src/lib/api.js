import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3001/api';

const instance = axios.create({ baseURL: BASE_URL, timeout: 15000 });

instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@zenith_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('@zenith_token');
    }
    return Promise.reject(err);
  }
);

const api = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default api;
