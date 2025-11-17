import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Formation {
  id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_COURS' | 'TERMINE' | 'A_VENIR';
  formateur: {
    id: string;
    nom: string;
    prenom: string;
  };
  dateInscription: string;
}

export function useUserFormations() {
  return useQuery<Formation[]>({
    queryKey: ['user-formations'],
    queryFn: async () => {
      const { data } = await api.get('/api/formations/mes-formations');
      return data;
    },
  });
}

export function useGenerateAttestation(formationId: string) {
  return useQuery({
    queryKey: ['attestation', formationId],
    queryFn: async () => {
      const response = await api.get(`/api/formations/${formationId}/attestation`, {
        responseType: 'blob',
      });
      
      // Créer une URL pour le fichier PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-formation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return url;
    },
    enabled: false, // Ne pas exécuter automatiquement
  });
}
