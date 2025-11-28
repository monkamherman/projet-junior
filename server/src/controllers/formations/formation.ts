import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFormations(req: Request, res: Response) {
  try {
    const formations = await prisma.formation.findMany();
    res.json(formations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des formations." });
  }
}

export async function getFormationById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }
    res.json(formation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la formation." });
  }
}

export async function createFormation(req: Request, res: Response) {
  console.log('=== NOUVELLE DEMANDE DE CRÉATION DE FORMATION ===');
  console.log('Données reçues:', req.body);
  
  const { titre, description, prix, dateDebut, dateFin, statut } = req.body;
  
  // Validation des champs requis
  if (!titre || !description || prix === undefined || !dateDebut || !dateFin) {
    console.error('Champs manquants dans la requête');
    return res.status(400).json({ 
      message: "Tous les champs sont obligatoires",
      errors: [
        !titre && { path: 'titre', message: 'Le titre est requis' },
        !description && { path: 'description', message: 'La description est requise' },
        prix === undefined && { path: 'prix', message: 'Le prix est requis' },
        !dateDebut && { path: 'dateDebut', message: 'La date de début est requise' },
        !dateFin && { path: 'dateFin', message: 'La date de fin est requise' }
      ].filter(Boolean)
    });
  }

  try {
    console.log('Tentative de création de la formation...');
    
    // Vérifier si l'utilisateur est authentifié et a un ID valide
    const userId = (req as any).user?.id; // Supposons que l'ID de l'utilisateur est dans req.user.id
    if (!userId) {
      console.error('Aucun ID utilisateur trouvé dans la requête');
      return res.status(401).json({ message: "Non autorisé - Utilisateur non identifié" });
    }

    const newFormation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: Number(prix),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        statut: statut || 'BROUILLON',
        formateurId: userId // Utiliser l'ID de l'utilisateur connecté comme formateur
      },
    });
    
    console.log('Formation créée avec succès:', newFormation);
    res.status(201).json(newFormation);
    
  } catch (error: any) {
    console.error('ERREUR lors de la création de la formation:', error);
    console.error('Détails de l\'erreur:', error.message);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "Une formation avec ce titre existe déjà",
        errors: [{ path: 'titre', message: 'Ce titre est déjà utilisé' }]
      });
    }
    
    res.status(500).json({ 
      message: "Erreur lors de la création de la formation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function updateFormation(req: Request, res: Response) {
  const { id } = req.params;
  const { titre, description, prix, dateDebut, dateFin, formateurId } = req.body;
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }
    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        titre,
        description,
        prix,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        formateurId,
      },
    });
    res.json(updatedFormation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la formation." });
  }
}

export async function deleteFormation(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }
    await prisma.formation.delete({ where: { id } });
    res.json({ message: "Formation supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la formation." });
  }
}
