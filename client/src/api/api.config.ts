// src/api/api.config.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Configuration de base
const BASE_URL = import.meta.env.VITE_API_URL || '';

console.log(
  "Configuration de l'API - URL de base:",
  BASE_URL,
  '(Mode:',
  import.meta.env.MODE + ')'
);

// Configuration axios par défaut
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: import.meta.env.DEV, // Seulement en développement local
  timeout: 45000, // 45 secondes pour gérer les cold starts de Render + email
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

// Intercepteur pour gérer les erreurs 401 et les timeouts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Gestion des timeouts et erreurs de réseau (cold starts Render + email)
    if (
      (error.code === 'ECONNABORTED' ||
        error.code === 'ECONNRESET' ||
        error.message?.includes('timeout')) &&
      originalRequest &&
      !originalRequest._retry &&
      (originalRequest._retryCount || 0) < 3
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      console.log(
        `Tentative de retry ${originalRequest._retryCount}/3 pour l'URL: ${originalRequest.url}`
      );

      // Attendre plus longtemps avant de retryer (cold start + email)
      const waitTime = Math.min(3000 * originalRequest._retryCount, 8000); // 3s, 6s, 8s max
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      return axiosInstance(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login')
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
