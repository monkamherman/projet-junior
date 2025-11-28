// src/api/api.config.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Configuration de base
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

console.log('Configuration de l\'API - URL de base:', BASE_URL, '(Mode:', import.meta.env.MODE + ')');

// Configuration axios par défaut
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Aucun token de rafraîchissement disponible');
        }

        // Appel direct à l'API de rafraîchissement
        const response = await axiosInstance.post<{ access: string }>(
          '/api/auth/refresh',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // En cas d'erreur de rafraîchissement, déconnecter l'utilisateur
        console.error('Erreur de rafraîchissement du token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
