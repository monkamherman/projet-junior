'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FormationForm } from '@/features/formations/components/formation-form';
import { createFormation } from '@/features/formations/api/formations';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateFormationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    if (!user?.token) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer une formation',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createFormation(data, user.token);
      toast({
        title: 'Succès',
        description: 'La formation a été créée avec succès',
      });
      router.push('/dashboard/formations');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création de la formation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="px-0">
          <Link href="/dashboard/formations" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste des formations
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
