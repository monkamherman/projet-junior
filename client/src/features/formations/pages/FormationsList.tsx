import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserFormations, useDeleteFormation } from '../hooks/useFormations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Composants UI personnalisés pour remplacer les composants manquants
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-left">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b">{children}</tr>
);

const TableHead = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <th className={`text-left p-2 ${className}`}>{children}</th>
);

const TableCell = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <td className={`p-2 ${className}`}>{children}</td>
);

const Badge = ({ variant = 'default', children }: { variant?: string, children: React.ReactNode }) => {
  const baseStyles = 'px-2 py-1 text-xs rounded-full';
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'bg-white border border-gray-300 text-gray-700',
  };
  
  return (
    <span className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.default}`}>
      {children}
    </span>
  );
};

const AlertDialog = ({ 
  open, 
  children,
  onClose
}: { 
  open: boolean; 
  children: React.ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-2">{children}</p>
);

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end space-x-2 mt-6">{children}</div>
);

const AlertDialogAction = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const AlertDialogCancel = ({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode; 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
  >
    {children}
  </button>
);

const AlertDialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg p-6 w-full max-w-md">
    {children}
  </div>
);

export function FormationsList() {
  const navigate = useNavigate();
  // Suppression de l'import et de l'utilisation de useToast qui n'est pas nécessaire ici
  const { data: formations = [], isLoading, error } = useUserFormations();
  const [formationToDelete, setFormationToDelete] = useState<string | null>(null);
  const deleteMutation = useDeleteFormation();

  const handleDelete = async () => {
    if (!formationToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(formationToDelete);
      setFormationToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'default';
      case 'TERMINE':
        return 'secondary';
      case 'A_VENIR':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div>Chargement des formations...</div>;
  }

  if (error) {
    return <div>Erreur lors du chargement des formations</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Formations</h2>
        <Button onClick={() => navigate('/dashboard/formations/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle formation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des formations</CardTitle>
        </CardHeader>
        <CardContent>
          {formations.length === 0 ? (
            <p className="text-muted-foreground">Aucune formation pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Date de fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formations.map((formation) => (
                  <TableRow key={formation.id}>
                    <TableCell className="font-medium">{formation.titre}</TableCell>
                    <TableCell>
                      {format(new Date(formation.dateDebut), 'PP', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(formation.dateFin), 'PP', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(formation.statut)}>
                        {formation.statut.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formation.formateur?.prenom} {formation.formateur?.nom}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dashboard/formations/edit/${formation.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setFormationToDelete(formation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog 
        open={!!formationToDelete} 
        onClose={() => setFormationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous vraiment supprimer cette formation ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormationToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
