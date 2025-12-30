import { api } from '@/lib/api';

// Types
export interface AttestationEtendue extends Attestation {
  inscription: {
    id: string;
    dateInscription: string;
    formation: {
      id: string;
      titre: string;
      description: string;
      dateDebut: string;
      dateFin: string;
      prix: number;
    };
  };
}
export interface Attestation {
  id: string;
  numero: string;
  urlPdf: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  dateEmission: string;
  dateTelechargement?: string;
}

export interface EligibiliteResponse {
  message: string;
  eligible: boolean;
  attestation?: Attestation;
  dateFin?: string;
  inscription?: {
    id: string;
    dateInscription: string;
  };
}

// Fonctions de service
export const verifierEligibilite = async (
  formationId: string
): Promise<EligibiliteResponse> => {
  const response = await api.get(
    `/api/attestations/verifier-eligibilite/${formationId}`
  );
  return response.data;
};

export const genererAttestation = async (
  formationId: string
): Promise<Attestation> => {
  const response = await api.post(`/api/attestations/generer/${formationId}`);
  return response.data;
};

// Récupérer la liste des attestations de l'utilisateur
export const getMesAttestations = async (): Promise<AttestationEtendue[]> => {
  const response = await api.get('/api/attestations');
  return response.data;
};

export const telechargerAttestation = async (
  attestationId: string
): Promise<void> => {
  const response = await api.get(
    `/api/attestations/telecharger/${attestationId}`,
    {
      responseType: 'blob',
    }
  );

  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `attestation-${attestationId}.pdf`);
  document.body.appendChild(link);
  link.click();

  // Nettoyer
  link.remove();
  window.URL.revokeObjectURL(url);
};
