import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

export type PaiementStatut = 'EN_ATTENTE' | 'EN_COURS' | 'VALIDE' | 'ANNULE' | 'ECHEC';

// Types
export type PaiementData = {
  formationId: string;
  montant: number;
  telephone: string;
  operateur: 'ORANGE_MONEY' | 'MTN_MONEY';
  mode: 'ORANGE_MONEY' | 'MTN_MONEY';
};

export type PaiementResponse = {
  id: string;
  reference: string;
  montant: number;
  statut: PaiementStatut;
  datePaiement: string;
  telephone: string;
  operateur: string;
};

// Créer un nouveau paiement
export const createPaiement = async (data: PaiementData): Promise<PaiementResponse> => {
  const response = await fetch('/api/paiements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création du paiement');
  }

  return response.json();
};

// Obtenir le statut d'un paiement
export const getPaiementStatus = async (reference: string): Promise<PaiementResponse> => {
  const response = await fetch(`/api/paiements/${reference}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération du statut du paiement');
  }

  return response.json();
};

// Lister les paiements de l'utilisateur
export const getPaiementsUtilisateur = async (): Promise<PaiementResponse[]> => {
  const response = await fetch('/api/paiements', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des paiements');
  }

  return response.json();
};

// Hook pour créer un paiement
export const useCreatePaiement = () => {
  return useMutation({
    mutationFn: createPaiement,
  });
};

// Hook pour obtenir le statut d'un paiement
export const usePaiementStatus = (
  reference: string, 
  options?: Omit<UseQueryOptions<PaiementResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaiementResponse, Error>({
    queryKey: ['paiement', reference],
    queryFn: () => getPaiementStatus(reference),
    enabled: !!reference,
    refetchInterval: (query) => {
      // Arrêter le rafraîchissement si le paiement est terminé
      const data = query.state.data as PaiementResponse | undefined;
      return data?.statut === 'EN_ATTENTE' || data?.statut === 'EN_COURS' ? 3000 : false;
    },
    ...options
  });
};

// Hook pour lister les paiements de l'utilisateur
export const usePaiementsUtilisateur = () => {
  return useQuery<PaiementResponse[], Error>({
    queryKey: ['paiements'],
    queryFn: getPaiementsUtilisateur,
  });
};
