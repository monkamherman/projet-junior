// src/api/auth.api.ts
import axios from './api.config';

export const authApi = {
  // Inscription
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => axios.post('/auth/register/', data),

  // Vérification OTP
  verifyOtp: (data: { email: string; otp: string }) =>
    axios.post('/auth/verify-otp/', data),

  // Connexion
  login: (data: { email: string; password: string }) =>
    axios.post('/auth/login/', data),

  // Déconnexion
  logout: () => axios.post('/auth/logout/'),

  // Rafraîchissement du token
  refreshToken: (refresh: string) => axios.post('/auth/refresh/', { refresh }),

  // Mot de passe oublié
  forgotPassword: (email: string) =>
    axios.post('/auth/password-reset/request/', { email }),

  // Réinitialisation du mot de passe
  resetPassword: (data: { token: string; password: string }) =>
    axios.post('/auth/password-reset/confirm/', data),
};
