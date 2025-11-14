// src/api/user.api.ts
import axios from './api.config';

export const userApi = {
  // Obtenir le profil utilisateur
  getProfile: () => axios.get('/users/profile/'),

  // Mettre à jour le profil
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }) => axios.patch('/users/profile/', data),

  // Changer le mot de passe
  changePassword: (data: { old_password: string; new_password: string }) =>
    axios.post('/users/password-change/', data),

  // Supprimer le compte
  deleteAccount: () => axios.delete('/users/delete-account/'),
};
