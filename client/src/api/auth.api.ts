// src/api/auth.api.ts
import axios from './api.config';

export const authApi = {
  // Envoi d'OTP pour inscription
  register: (data: {
    email: string;
    motDePasse: string;
    nom: string;
    prenom: string;
    telephone: string;
  }) => axios.post('/auth/register', data),

  // Vérification OTP et création de compte
  verifyOtpAndRegister: (data: {
    email: string;
    otp: string;
    nom: string;
    prenom: string;
    telephone: string;
    motDePasse: string;
  }) => axios.post('/auth/verify-otp', data),

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
