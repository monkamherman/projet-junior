import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  const response = await fetch('/api/attestations', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Erreur lors de la récupération des attestations'
    );
  }

  return response.json();
};

export const verifierEligibiliteAttestation = async (
  formationId: string
): Promise<EligibiliteResponse> => {
  const response = await fetch(
    `/api/attestations/verifier-eligibilite/${formationId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors de la vérification d'éligibilité"
    );
  }

  return response.json();
};

export const genererMonAttestation = async (
  formationId: string
): Promise<{ message: string; attestation: Attestation }> => {
  const response = await fetch('/api/attestations/generer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ formationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors de la génération de l'attestation"
    );
  }

  return response.json();
};

export const telechargerAttestation = async (
  attestationId: string
): Promise<void> => {
  const response = await fetch(
    `/api/attestations/${attestationId}/telecharger`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors du téléchargement de l'attestation"
    );
  }

  // La réponse est une redirection vers le PDF
  window.location.href = response.url;
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
