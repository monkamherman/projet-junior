// src/api/auth.api.ts
import axios from './api.config';

export const authApi = {
  // Envoi des informations d'inscription et demande d'OTP
  register: (data: {
    email: string;
    motDePasse: string;
    nom: string;
    prenom: string;
    telephone: string;
  }) => axios.post('/auth/signup', data),

  // Vérification de l'OTP
  verifyOtp: (data: {
    email: string;
    otp: string;
    nom: string;
    prenom: string;
    telephone: string;
    motDePasse: string;
  }) => axios.post('/auth/verify-otp', data),

  // Connexion
  login: (data: { email: string; password: string }) =>
    axios.post('/api/auth/login', data),

  // Déconnexion
  logout: () => axios.post('/api/auth/logout'),

  // Rafraîchissement du token
  refreshToken: (refresh: string) =>
    axios.post('/api/auth/refresh', { refresh }),

  // Mot de passe oublié
  forgotPassword: (email: string) =>
    axios.post('/api/auth/password-reset/request', { email }),

  // Réinitialisation du mot de passe
  resetPassword: (data: { token: string; password: string }) =>
    axios.post('/api/auth/password-reset/confirm', data),
};
