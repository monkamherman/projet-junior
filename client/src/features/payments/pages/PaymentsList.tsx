import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PaymentsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Paiements</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aucun paiement pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
