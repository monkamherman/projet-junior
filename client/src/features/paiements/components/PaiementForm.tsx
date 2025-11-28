import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Schéma de validation avec Zod
const paiementSchema = z.object({
  mode: z.enum(['ORANGE_MONEY', 'MTN_MONEY']),
  telephone: z.string().min(9, 'Le numéro de téléphone est requis')
    .regex(/^[0-9]+$/, 'Le numéro de téléphone ne doit contenir que des chiffres'),
});

type PaiementFormValues = z.infer<typeof paiementSchema>;

interface PaiementFormProps {
  formationId: string;
  montant: number;
  onSuccess: () => void;
}

export function PaiementForm({ formationId, montant, onSuccess }: PaiementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [referencePaiement, setReferencePaiement] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<PaiementFormValues>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      mode: 'ORANGE_MONEY',
      telephone: '',
    },
  });

  // Vérifier périodiquement l'état du paiement
  useEffect(() => {
    if (!referencePaiement || !paiementEnCours) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/paiements/${referencePaiement}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.statut === 'VALIDE') {
            setPaiementEnCours(false);
            toast({
              title: 'Paiement réussi',
              description: 'Votre paiement a été validé avec succès !',
            });
            onSuccess();
          } else if (['ANNULE', 'ECHEC'].includes(data.statut)) {
            setPaiementEnCours(false);
            toast({
              title: 'Paiement échoué',
              description: 'Une erreur est survenue lors du traitement de votre paiement.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [referencePaiement, paiementEnCours, toast, onSuccess]);

  const onSubmit = async (data: PaiementFormValues) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/paiements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          formationId,
          montant,
          telephone: data.telephone,
          operateur: data.mode,
          mode: data.mode
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const result = await response.json();
      setReferencePaiement(result.reference);
      setPaiementEnCours(true);
      
      toast({
        title: 'Paiement en cours',
        description: 'Votre paiement est en cours de traitement. Vous recevrez une notification une fois validé.',
      });
      
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement de votre paiement.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Montant à payer: <span className="font-semibold text-foreground">{montant} FCFA</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Méthode de paiement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un moyen de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                    <SelectItem value="MTN_MONEY">MTN Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de téléphone</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {form.watch('mode') === 'ORANGE_MONEY' ? '+225' : '+237'}
                    </span>
                    <Input 
                      placeholder={form.watch('mode') === 'ORANGE_MONEY' ? '07 12 34 56 78' : '6 12 34 56 78'}
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
                  Entrez votre numéro de téléphone pour recevoir la demande de paiement
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || paiementEnCours}
          >
            {isLoading || paiementEnCours ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {paiementEnCours ? 'Traitement en cours...' : 'Vérification...'}
              </>
            ) : (
              'Payer maintenant'
            )}
          </Button>
          
          {paiementEnCours && referencePaiement && (
            <div className="text-sm text-muted-foreground text-center">
              <p>Référence: {referencePaiement}</p>
              <p>Veuillez valider le paiement sur votre téléphone.</p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
