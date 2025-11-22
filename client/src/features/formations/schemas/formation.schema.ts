import { z } from 'zod';

export const formationSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  duration: z.number().min(1, 'La durée doit être supérieure à 0'),
  level: z.enum(['débutant', 'intermédiaire', 'avancé']),
  price: z.number().min(0, 'Le prix ne peut pas être négatif'),
  isPublished: z.boolean().default(false),
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide'),
  imageUrl: z.string().url('URL de l\'image invalide').optional(),
});

export type FormationFormValues = z.infer<typeof formationSchema>;
