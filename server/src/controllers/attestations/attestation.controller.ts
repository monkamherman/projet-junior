import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateCertificate } from "../../services/certificateService";

const prisma = new PrismaClient();

export const getMesAttestations = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const attestations = await prisma.attestation.findMany({
      where: {
        inscription: {
          utilisateurId: req.user.id,
        },
      },
      include: {
        inscription: {
          include: {
            formation: {
              select: {
                id: true,
                titre: true,
                description: true,
                dateDebut: true,
                dateFin: true,
                prix: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateEmission: "desc",
      },
    });

    res.json(attestations);
  } catch (error) {
    console.error("Erreur lors de la récupération des attestations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la récupération des attestations",
      error: errorMessage,
    });
  }
};

/**
 * Vérifier si une attestation peut être générée pour une formation
 */
export const verifierEligibiliteAttestation = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { formationId } = req.params;

    // Vérifier l'inscription et le paiement
    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
        statut: "VALIDEE",
      },
      include: {
        paiement: true,
        formation: true,
        attestation: true,
      },
    });

    if (!inscription) {
      return res.status(404).json({
        message: "Inscription non trouvée ou non validée",
        eligible: false,
      });
    }

    // Vérifier si le paiement est validé
    if (!inscription.paiement || inscription.paiement.statut !== "VALIDE") {
      return res.status(400).json({
        message: "Le paiement doit être validé pour obtenir une attestation",
        eligible: false,
      });
    }

    // Vérifier si une attestation existe déjà
    if (inscription.attestation) {
      return res.json({
        message: "Attestation déjà générée",
        eligible: false,
        attestation: inscription.attestation,
      });
    }

    // Vérifier si la formation est terminée
    const maintenant = new Date();
    const dateFinFormation = new Date(inscription.formation.dateFin);

    if (maintenant < dateFinFormation) {
      return res.status(400).json({
        message: "La formation n'est pas encore terminée",
        eligible: false,
        dateFin: inscription.formation.dateFin,
      });
    }

    res.json({
      message: "Éligible pour la génération d'attestation",
      eligible: true,
      inscription: {
        id: inscription.id,
        dateInscription: inscription.dateInscription,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification d'éligibilité:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la vérification d'éligibilité",
      error: errorMessage,
    });
  }
};

/**
 * Générer une attestation pour l'utilisateur connecté
 */
export const genererMonAttestation = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { formationId } = req.body;

    // Vérifier l'éligibilité
    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
        statut: "VALIDEE",
      },
      include: {
        paiement: true,
        formation: true,
        utilisateur: true,
        attestation: true,
      },
    });

    if (!inscription) {
      return res.status(404).json({
        message: "Inscription non trouvée ou non validée",
      });
    }

    // Vérifications
    if (!inscription.paiement || inscription.paiement.statut !== "VALIDE") {
      return res.status(400).json({
        message: "Le paiement doit être validé pour générer une attestation",
      });
    }

    if (inscription.attestation) {
      return res.status(400).json({
        message: "Une attestation existe déjà pour cette formation",
      });
    }

    // Vérifier si la formation est terminée
    const maintenant = new Date();
    const dateFinFormation = new Date(inscription.formation.dateFin);

    if (maintenant < dateFinFormation) {
      return res.status(400).json({
        message: "La formation n'est pas encore terminée",
      });
    }

    // Générer le certificat
    const certificateData = await generateCertificate(inscription);

    // Créer l'attestation
    const attestation = await prisma.attestation.create({
      data: {
        numero: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        urlPdf: certificateData.url,
        statut: "GENEREE",
        dateEmission: new Date(),
        utilisateur: { connect: { id: req.user.id } },
        formation: { connect: { id: formationId } },
        inscription: { connect: { id: inscription.id } },
      },
      include: {
        inscription: {
          include: {
            formation: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Attestation générée avec succès",
      attestation,
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'attestation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la génération de l'attestation",
      error: errorMessage,
    });
  }
};

/**
 * Télécharger son attestation
 */
export const telechargerMonAttestation = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { id } = req.params;

    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    if (!attestation) {
      return res.status(404).json({ message: "Attestation non trouvée" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (attestation.inscription.utilisateurId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à accéder à cette attestation" });
    }

    // Mettre à jour le statut
    await prisma.attestation.update({
      where: { id },
      data: {
        statut: "TELECHARGEE",
        dateTelechargement: new Date(),
      },
    });

    // Rediriger vers le fichier PDF
    res.redirect(attestation.urlPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'attestation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors du téléchargement de l'attestation",
      error: errorMessage,
    });
  }
};
