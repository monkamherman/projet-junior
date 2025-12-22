import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

// Schéma de validation avec Zod
const paiementSchema = z.object({
  mode: z.enum(['ORANGE_MONEY', 'MTN_MONEY']),
  telephone: z
    .string()
    .min(9, 'Le numéro de téléphone est requis')
    .regex(
      /^[0-9]+$/,
      'Le numéro de téléphone ne doit contenir que des chiffres'
    ),
});

type PaiementFormValues = z.infer<typeof paiementSchema>;

interface PaiementFormProps {
  formationId: string;
  montant: number;
  onSuccess: () => void;
}

export function PaiementForm({
  formationId,
  montant,
  onSuccess,
}: PaiementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Récupérer la méthode de paiement depuis les paramètres d'URL
  const selectedMethod =
    (searchParams.get('method') as 'ORANGE_MONEY' | 'MTN_MONEY') ||
    'ORANGE_MONEY';

  const form = useForm<PaiementFormValues>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      mode: selectedMethod,
      telephone: '',
    },
  });

  const onSubmit = async (data: PaiementFormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/paiements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          formationId,
          montant,
          telephone: data.telephone,
          operateur: selectedMethod,
          mode: selectedMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      await response.json();

      // En simulation, le paiement est validé directement après 3 secondes
      // On affiche un message de succès immédiat
      toast({
        title: 'Paiement simulé avec succès',
        description:
          'Votre paiement a été validé automatiquement (mode simulation).',
      });

      // Rediriger vers la page de confirmation après un court délai
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast({
        title: 'Erreur',
        description:
          'Une erreur est survenue lors du traitement de votre paiement.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Montant à payer:{' '}
          <span className="font-semibold text-foreground">{montant} FCFA</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Affichage de la méthode de paiement sélectionnée */}
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Méthode de paiement
            </p>
            <p className="font-semibold text-foreground">
              {selectedMethod === 'ORANGE_MONEY'
                ? 'Orange Money'
                : 'MTN Mobile Money'}
            </p>
          </div>

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de téléphone</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {selectedMethod === 'ORANGE_MONEY' ? '+225' : '+237'}
                    </span>
                    <Input
                      placeholder={
                        selectedMethod === 'ORANGE_MONEY'
                          ? '07 12 34 56 78'
                          : '6 12 34 56 78'
                      }
                      {...field}
                      onChange={(e) => {
                        // N'autoriser que les chiffres
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Entrez votre numéro de téléphone pour recevoir la demande de
                  paiement
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              'Payer maintenant (Simulation)'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
