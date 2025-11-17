import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Payment {
  id: string;
  montant: number;
  datePaiement: string;
  methode: 'CARTE' | 'VIREMENT' | 'ESPECES' | 'AUTRE';
  statut: 'PAYE' | 'EN_ATTENTE' | 'ANNULE' | 'ERREUR';
  reference: string;
  formation: {
    id: string;
    titre: string;
  };
}

export function useUserPayments() {
  return useQuery<Payment[]>({
    queryKey: ['user-payments'],
    queryFn: async () => {
      const { data } = await api.get('/api/payments/mes-paiements');
      return data;
    },
  });
}

export function usePaymentDetails(paymentId: string) {
  return useQuery<Payment>({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/payments/${paymentId}`);
      return data;
    },
    enabled: !!paymentId,
  });
}
