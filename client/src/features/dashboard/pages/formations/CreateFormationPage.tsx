import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createFormation } from '@/features/formations/api/formations';
import { FormationForm } from '@/features/formations/components/formation-form';
import type { FormationFormValues } from '@/features/formations/schemas/formation.schema';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateFormationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: FormationFormValues) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vous devez être connecté pour créer une formation');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFormation(data, token);
      toast.success('La formation a été créée avec succès');
      navigate('/dashboard/formations');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la formation';
      toast.error(errorMessage);
    } finally {
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
          <FormationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
