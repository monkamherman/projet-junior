import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Download,
  Loader2,
} from 'lucide-react';
import {
  useGenererAttestation,
  useVerifierEligibilite,
} from '../api/attestations.api';

interface AttestationButtonProps {
  formationId: string;
  dateFin: string;
  className?: string;
}

export function AttestationButton({
  formationId,
  dateFin,
  className = '',
}: AttestationButtonProps) {
  const { toast } = useToast();

  const { data: eligibilite, isLoading: verificationLoading } =
    useVerifierEligibilite(formationId);
  const genererAttestation = useGenererAttestation();

  const handleGenererAttestation = async () => {
    try {
      await genererAttestation.mutateAsync(formationId);
      toast({
        title: 'Attestation générée',
        description: 'Votre attestation a été générée avec succès!',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la génération de l'attestation.";
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Vérifier si la formation est terminée
  const estFormationTerminee = new Date() >= new Date(dateFin);

  if (verificationLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Vérification...
      </Button>
    );
  }

  // Si la formation n'est pas terminée
  if (!estFormationTerminee) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled className={className}>
              <Clock className="mr-2 h-4 w-4" />
              En attente
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>L'attestation sera disponible après la fin de la formation</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fin: {new Date(dateFin).toLocaleDateString('fr-FR')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Si non éligible pour une autre raison
  if (eligibilite && !eligibilite.eligible) {
    if (eligibilite.attestation) {
      // Attestation déjà générée
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Disponible
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/mes-attestations`, '_blank')}
            className={className}
          >
            <Download className="mr-2 h-4 w-4" />
            Voir
          </Button>
        </div>
      );
    }

    // Autre raison de non-éligibilité
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled className={className}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Non disponible
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{eligibilite.message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Si éligible pour générer l'attestation
  return (
    <Button
      onClick={handleGenererAttestation}
      disabled={genererAttestation.isPending}
      className={`flex items-center gap-2 ${className}`}
    >
      {genererAttestation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Award className="h-4 w-4" />
          Générer l'attestation
        </>
      )}
    </Button>
  );
}
