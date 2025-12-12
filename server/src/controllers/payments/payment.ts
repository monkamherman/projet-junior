import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function createPayment(req: Request, res: Response) {
  const { inscriptionId, reference, montant, mode, commentaire } = req.body;

  try {
    // Vérifier que l'inscription existe
    const inscription = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
    });
    if (!inscription) {
      return res.status(404).json({ message: "Inscription non trouvée." });
    }

    // Créer le paiement
    const payment = await prisma.paiement.create({
      data: {
        inscriptionId,
        reference,
        montant,
        mode,
        commentaire,
        statut: "SUCCES",
        datePaiement: new Date(),
        utilisateurId: inscription.utilisateurId,
      },
    });

    // Mettre à jour le statut de l'inscription
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { statut: "VALIDEE" },
    });

    // TODO: Débloquer l'accès à l'attestation (logique à implémenter selon besoin)

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du paiement." });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await prisma.paiement.findMany();
    res.json(payments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des paiements." });
  }
}

export async function getPaymentById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const payment = await prisma.paiement.findUnique({ where: { id } });
    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé." });
    }
    res.json(payment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du paiement." });
  }
}

export async function updatePayment(req: Request, res: Response) {
  const { id } = req.params;
  const { reference, montant, mode, statut, commentaire } = req.body;
  try {
    const payment = await prisma.paiement.findUnique({ where: { id } });
    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé." });
    }
    const updatedPayment = await prisma.paiement.update({
      where: { id },
      data: {
        reference,
        montant,
        mode,
        statut,
        commentaire,
      },
    });
    res.json(updatedPayment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du paiement." });
  }
}

export async function deletePayment(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const payment = await prisma.paiement.findUnique({ where: { id } });
    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé." });
    }
    await prisma.paiement.delete({ where: { id } });
    res.json({ message: "Paiement supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du paiement." });
  }
}
