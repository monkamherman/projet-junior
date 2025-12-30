import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Loader2, ReceiptText } from 'lucide-react';
import { PaymentDialog } from './PaymentDialog';
import type { PaymentDetails } from './types';
import { useAttestationFlow } from './useAttestationFlow';

interface AttestationButtonProps {
  formationId: string;
  className?: string;
}

export function AttestationButton({
  formationId,
  className = '',
}: AttestationButtonProps) {
  const { toast } = useToast();
  const {
    status,
    isDialogOpen,
    isCheckingEligibility,
    attestation,
    eligibility,
    lastPaiement,
    openPaymentDialog,
    closePaymentDialog,
    submitPayment,
    downloadAttestation,
    downloadReceipt,
  } = useAttestationFlow(formationId);

  const isProcessingPayment =
    status === 'processing_payment' || status === 'generating_attestation';
  const isLoading = isCheckingEligibility || isProcessingPayment;

  const handlePrimaryAction = async () => {
    try {
      await openPaymentDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'ouvrir le dialogue de paiement.";
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSubmit = async (paymentDetails: PaymentDetails) => {
    try {
      const { paiement } = await submitPayment(paymentDetails);

      toast({
        title: 'Paiement enregistré',
        description:
          'Votre paiement a été validé et le traitement de votre attestation est terminé.',
      });

      await downloadReceipt(paiement.id);
      toast({
        title: 'Reçu téléchargé',
        description: 'Le reçu de paiement a été téléchargé avec succès.',
      });

      return paiement;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Le paiement a échoué. Veuillez réessayer.';
      toast({
        title: 'Échec du paiement',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDownloadAttestation = async () => {
    if (!attestation) return;

    try {
      await downloadAttestation(attestation.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de télécharger l'attestation.";
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Aucun reçu disponible pour ce paiement.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (attestation) {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        <Button
          onClick={handleDownloadAttestation}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Télécharger mon attestation
        </Button>
        {lastPaiement && (
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadReceipt}
          >
            <ReceiptText className="h-4 w-4" />
            Reçu de paiement
          </Button>
        )}
      </div>
    );
  }

  if (eligibility && eligibility.eligible === false) {
    return (
      <Button disabled className={className}>
        <Award className="mr-2 h-4 w-4" />
        {eligibility.reason ?? 'Non éligible'}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handlePrimaryAction}
        disabled={isLoading}
        className={`flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Award className="h-4 w-4" />
            Obtenir mon attestation
          </>
        )}
      </Button>

      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentDialog();
          }
        }}
        onPaymentSubmit={handlePaymentSubmit}
        formationId={formationId}
        defaultAmount={5000}
        isProcessing={isProcessingPayment}
      />
    </>
  );
}
