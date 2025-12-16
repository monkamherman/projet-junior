import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

// Types
export interface Attestation {
  id: string;
  numero: string;
  urlPdf: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  dateEmission: string;
  dateTelechargement?: string;
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

// API functions
export const getMesAttestations = async (): Promise<Attestation[]> => {
  const response = await api.get('/api/attestations');
  return response.data;
};

export const verifierEligibiliteAttestation = async (
  formationId: string
): Promise<EligibiliteResponse> => {
  const response = await api.get(
    `/api/attestations/verifier-eligibilite/${formationId}`
  );
  return response.data;
};

export const genererMonAttestation = async (
  formationId: string
): Promise<{ message: string; attestation: Attestation }> => {
  const response = await api.post('/api/attestations/generer', { formationId });
  return response.data;
};

export const telechargerAttestation = async (
  attestationId: string
): Promise<void> => {
  const response = await api.get(
    `/api/attestations/${attestationId}/telecharger`
  );
  // La réponse est une redirection vers le PDF
  window.location.href = response.data.url;
};

// Hooks
export const useMesAttestations = () => {
  return useQuery<Attestation[], Error>({
    queryKey: ['mes-attestations'],
    queryFn: getMesAttestations,
  });
};

export const useVerifierEligibilite = (formationId: string) => {
  return useQuery<EligibiliteResponse, Error>({
    queryKey: ['eligibilite-attestation', formationId],
    queryFn: () => verifierEligibiliteAttestation(formationId),
    enabled: !!formationId,
  });
};

export const useGenererAttestation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formationId: string) => genererMonAttestation(formationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mes-attestations'] });
    },
  });
};

export const useTelechargerAttestation = () => {
  return useMutation({
    mutationFn: (attestationId: string) =>
      telechargerAttestation(attestationId),
  });
};
