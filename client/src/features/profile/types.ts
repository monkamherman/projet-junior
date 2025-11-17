export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'FORMATEUR' | 'APPRENANT';
  createdAt: string;
  updatedAt: string;
  // Ajoutez d'autres champs de profil si nécessaire
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
