// frontend/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Создаём инстанс с базовыми настройками
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    //  Автоматически добавляем токен из локалстора
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Интерцептор для глобальной обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Обработка 401 — автоматический выход
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Можно добавить редирект на /login через события
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;