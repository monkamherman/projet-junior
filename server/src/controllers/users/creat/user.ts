import { PrismaClient, Utilisateur } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { AuthenticatedUser } from "../../middlewares/auth.middleware";

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const prisma = new PrismaClient();

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    // Récupérer l'utilisateur avec ses formations et attestations
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
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

    // Récupérer les formations de l'utilisateur
    const inscriptions = await prisma.inscription.findMany({
      where: {
        utilisateurId: req.user.id,
        statut: "VALIDEE",
      },
      include: {
        formation: {
          include: {
            formateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    // Transformer les inscriptions en formations
    const formations = inscriptions.map((inscription) => ({
      id: inscription.formation.id,
      titre: inscription.formation.titre,
      description: inscription.formation.description,
      dateDebut: inscription.formation.dateDebut,
      duree: Math.ceil(
        (new Date(inscription.formation.dateFin).getTime() -
          new Date(inscription.formation.dateDebut).getTime()) /
          (1000 * 60 * 60 * 24)
      ), // Durée en jours
      statut:
        new Date() > new Date(inscription.formation.dateFin)
          ? ("TERMINÉ" as const)
          : new Date() >= new Date(inscription.formation.dateDebut)
            ? ("EN_COURS" as const)
            : ("NON_COMMENCÉ" as const),
    }));

    // Récupérer les attestations de l'utilisateur
    const attestations = await prisma.attestation.findMany({
      where: {
        utilisateurId: req.user.id,
      },
      include: {
        formation: true,
      },
    });

    // Transformer les attestations
    const attestationsFormatted = attestations.map((attestation) => ({
      id: attestation.id,
      titre: `Attestation - ${attestation.formation.titre}`,
      formation: attestation.formation.titre,
      dateDelivrance: attestation.dateEmission,
    }));

    // Combiner les données
    const profileData = {
      ...user,
      formations,
      attestations: attestationsFormatted,
    };

    res.json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du profil.",
    });
  }
}

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

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Le mot de passe actuel et le nouveau mot de passe sont requis.",
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        motDePasse: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.motDePasse
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ message: "Le mot de passe actuel est incorrect." });
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { motDePasse: hashedNewPassword },
    });

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du mot de passe.",
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
