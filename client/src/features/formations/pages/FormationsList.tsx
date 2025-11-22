import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function FormationsList() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Formations</h2>
        <Button onClick={() => router.push('/dashboard/formations/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle formation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des formations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aucune formation pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
