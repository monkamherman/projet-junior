import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFormation } from '@/features/formations/api/formations';
import { FormationForm } from '@/features/formations/components/formation-form';
import type { FormationFormValues } from '@/features/formations/schemas/formation.schema';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function CreateFormationPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data: FormationFormValues) => {
    console.log('handleSubmit appelé avec les données:', data);

    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token ? 'présent' : 'absent');

    if (!token) {
      console.error('Aucun token trouvé dans le localStorage');
      toast.error('Vous devez être connecté pour créer une formation');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    console.log('Début de la soumission...');

    try {
      console.log('Appel de createFormation avec les données:', data);
      const result = await createFormation(data, token);
      console.log('Réponse de createFormation:', result);

      toast.success('La formation a été créée avec succès');
      console.log('Redirection vers /dashboard/formations');
      navigate('/dashboard/formations');
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);

      // Gestion des erreurs de validation
      if (error.validationErrors) {
        console.log('Erreurs de validation:', error.validationErrors);
        setFormErrors(error.validationErrors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        const errorMessage =
          error.message ||
          'Une erreur est survenue lors de la création de la formation';
        console.error("Message d'erreur:", errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      console.log('Fin de la soumission, isSubmitting = false');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="flex items-center gap-2">
          <Link to="/dashboard/formations">
            <ArrowLeft className="h-4 w-4" />
            Retour aux formations
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle formation</CardTitle>
        </CardHeader>
        <CardContent>
          <FormationForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={formErrors}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateFormationPage() {
  return (
    <ProtectedRoute>
      <CreateFormationPageContent />
    </ProtectedRoute>
  );
}
