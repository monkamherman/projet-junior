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
  const { titre, description, prix, dateDebut, dateFin, formateurId } = req.body;
  try {
    const newFormation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        formateurId,
      },
    });
    res.status(201).json(newFormation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la formation." });
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
