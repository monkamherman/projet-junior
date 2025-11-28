import { usePaiementsUtilisateur } from '../api/paiement.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PaiementStatusBadge } from './PaiementStatusBadge';

export function PaiementHistory() {
  const { data: paiements, isLoading, error } = usePaiementsUtilisateur();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement de l'historique des paiements.
        </AlertDescription>
      </Alert>
    );
  }

  if (!paiements || paiements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun paiement trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paiements.map((paiement) => {
        const datePaiement = new Date(paiement.datePaiement);
        
        return (
          <div key={paiement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Référence: {paiement.reference}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(datePaiement, 'PPPp', { locale: fr })}
                </p>
              </div>
              <PaiementStatusBadge statut={paiement.statut} />
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Montant:</span>{' '}
                  {new Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(paiement.montant)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Opérateur:</span>{' '}
                  {paiement.operateur.replace('_', ' ')}
                </p>
              </div>
              <p className="text-sm">
                <span className="font-medium">Tél:</span> {paiement.telephone}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
