import { PrismaClient, Utilisateur } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'utilisateur.",
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { nom, prenom, email, telephone, motDePasse } = req.body;

  try {
    const user = await prisma.utilisateur.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const dataToUpdate: Partial<
      Omit<Utilisateur, "id" | "createdAt" | "updatedAt">
    > = {
      nom,
      prenom,
      email,
      telephone,
    };

    if (motDePasse) {
      dataToUpdate.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de l'utilisateur.",
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await prisma.utilisateur.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    await prisma.utilisateur.delete({ where: { id } });

    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'utilisateur.",
    });
  }
}
