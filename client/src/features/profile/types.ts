export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'FORMATEUR' | 'APPRENANT';
  createdAt: string;
  updatedAt: string;
  // Ajout des formations et attestations
  formations?: Array<{
    id: string;
    titre: string;
    description: string;
    dateDebut: string;
    duree: number;
    statut: 'TERMINÉ' | 'EN_COURS' | 'NON_COMMENCÉ';
  }>;
  attestations?: Array<{
    id: string;
    titre: string;
    formation: string;
    dateDelivrance: string;
  }>;
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
