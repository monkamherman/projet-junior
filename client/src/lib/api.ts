import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

type ApiResponse<T = unknown> = Promise<T>;

// Configuration de l'URL de base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si non authentifié
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les appels API
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): ApiResponse<T> => 
  api.get<T>(url, config).then((res) => res.data);

export const apiPost = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.post<T>(url, data, config).then((res) => res.data);

export const apiPut = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.put<T>(url, data, config).then((res) => res.data);

export const apiDelete = <T = void>(
  url: string, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.delete<T>(url, config).then((res) => res.data);

export const apiPatch = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.patch<T>(url, data, config).then((res) => res.data);
