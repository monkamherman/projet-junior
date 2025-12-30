import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Award, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  useGenererAttestation,
  useVerifierEligibilite,
} from '../api/attestations.api';
import { PaymentDialog } from './PaymentDialog';

interface AttestationButtonProps {
  formationId: string;
  className?: string;
}

export function AttestationButton({
  formationId,
  className = '',
}: AttestationButtonProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Nouvel état pour gérer le traitement

  const { toast } = useToast();
  const { data: eligibilite, isLoading: verificationLoading } =
    useVerifierEligibilite(formationId);

  const {
    mutateAsync: genererAttestation,
    isPending: isGeneratingAttestation,
  } = useGenererAttestation();

  const handlePaymentSubmit = async (data: {
    method: 'orange' | 'mtn';
    phoneNumber: string;
    amount: number;
  }) => {
    console.log('Données de paiement reçues:', data);

    // Commencer le traitement
    setIsProcessingPayment(true);

    // Fermer la boîte de dialogue immédiatement
    setIsPaymentDialogOpen(false);

    try {
      // Étape 1: Simulation de paiement (1.5s)
      toast({
        title: 'Traitement du paiement...',
        description: `Veuillez confirmer le paiement de ${data.amount} FCFA sur votre téléphone.`,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Étape 2: Après simulation réussie, générer l'attestation
      console.log(
        "Simulation de paiement réussie, génération de l'attestation..."
      );

      await genererAttestation(formationId);

      // Étape 3: Afficher le succès
      toast({
        title: 'Paiement réussi !',
        description: `Paiement de ${data.amount} FCFA effectué avec succès via ${data.method === 'orange' ? 'Orange Money' : 'MTN Mobile Money'} au ${data.phoneNumber}. L'attestation a été générée.`,
      });
    } catch (error) {
      console.error('Erreur lors du processus:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement.',
        variant: 'destructive',
      });
    } finally {
      // Arrêter le traitement
      setIsProcessingPayment(false);
    }
  };

  const handleButtonClick = () => {
    console.log(
      'Ouverture du dialogue de paiement pour formation:',
      formationId
    );
    setIsPaymentDialogOpen(true);
  };

  if (verificationLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Vérification...
      </Button>
    );
  }

  if (!eligibilite || !eligibilite.eligible) {
    if (eligibilite && eligibilite.attestation) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/mes-attestations`, '_blank')}
          className={className}
        >
          <Award className="mr-2 h-4 w-4" />
          Télécharger l'attestation
        </Button>
      );
    }

    return (
      <Button disabled className={className}>
        <Award className="mr-2 h-4 w-4" />
        Non disponible
      </Button>
    );
  }

  // Calculer l'état de chargement
  const isLoading = isProcessingPayment || isGeneratingAttestation;

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={verificationLoading || isLoading}
        className={`flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <Award className="h-4 w-4" />
            S'inscrire maintenant
          </>
        )}
      </Button>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentSubmit={handlePaymentSubmit}
        defaultAmount={5000}
        isProcessing={isProcessingPayment}
      />
    </>
  );
}
