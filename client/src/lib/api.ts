import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Utilisation du proxy Vite en développement
const isDev = import.meta.env.DEV;
const API_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:10000');

export const api: AxiosInstance = axios.create({
  baseURL: isDev ? '/api' : `${API_URL}/api`,
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
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) => 
  api.get<T>(url, config).then((res) => res.data);

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  api.post<T>(url, data, config).then((res) => res.data);

export const apiPut = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  api.put<T>(url, data, config).then((res) => res.data);

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config).then((res) => res.data);

export const apiPatch = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  api.patch<T>(url, data, config).then((res) => res.data);
