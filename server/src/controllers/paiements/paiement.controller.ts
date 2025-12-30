import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { generatePaymentReceiptPdf } from "../../services/paymentReceipt.service";

const prisma = new PrismaClient();

// Schéma de validation pour la création d'un paiement
const createPaiementSchema = z.object({
  formationId: z.string().min(1, "L'ID de la formation est requis"),
  montant: z.number().min(0, "Le montant doit être positif"),
  telephone: z.string().min(9, "Le numéro de téléphone est invalide"),
  operateur: z.enum(["ORANGE_MONEY", "MTN_MONEY"]),
  mode: z.enum(["ORANGE_MONEY", "MTN_MONEY", "CARTE", "ESPECES", "VIREMENT"]),
  code: z.string().optional(),
  commentaire: z.string().optional(),
});

/**
 * Crée un nouveau paiement
 */
export const creerPaiement = async (req: Request, res: Response) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Valider les données de la requête
    const validation = createPaiementSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.issues,
      });
    }

    const {
      formationId,
      montant,
      telephone,
      operateur,
      mode,
      code,
      commentaire,
    } = validation.data;
    const utilisateurId = req.user.id;

    // Vérifier si l'utilisateur et la formation existent
    const [utilisateur, formation] = await Promise.all([
      prisma.utilisateur.findUnique({ where: { id: utilisateurId } }),
      prisma.formation.findUnique({ where: { id: formationId } }),
    ]);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée" });
    }

    // Vérifier si l'utilisateur est déjà inscrit à cette formation
    const inscriptionExistante = await prisma.inscription.findFirst({
      where: {
        utilisateurId,
        formationId,
      },
    });

    if (inscriptionExistante) {
      return res.status(400).json({
        message: "Vous êtes déjà inscrit à cette formation",
      });
    }

    // Créer une référence unique pour le paiement
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Créer le paiement
    const paiement = await prisma.paiement.create({
      data: {
        reference,
        montant,
        mode,
        telephone,
        operateur,
        code: code || null,
        commentaire: commentaire || null,
        statut: "EN_ATTENTE",
        utilisateur: { connect: { id: utilisateurId } },
        formation: { connect: { id: formationId } },
      },
    });

    // Dans un environnement réel, ici vous feriez l'appel à l'API de paiement
    // Pour ce prototype, nous allons simuler un paiement réussi après 3 secondes
    setTimeout(async () => {
      try {
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "VALIDE",
            datePaiement: new Date(),
          },
        });

        // Créer automatiquement une inscription si le paiement est validé
        const inscription = await prisma.inscription.create({
          data: {
            dateInscription: new Date(),
            statut: "VALIDEE",
            utilisateur: { connect: { id: utilisateurId } },
            formation: { connect: { id: formationId } },
            paiement: { connect: { id: paiement.id } },
          },
        });

        // Vérifier si la formation est terminée pour générer automatiquement l'attestation
        const formation = await prisma.formation.findUnique({
          where: { id: formationId },
        });

        if (formation) {
          const maintenant = new Date();
          const dateFinFormation = new Date(formation.dateFin);

          // Si la formation est déjà terminée, générer l'attestation automatiquement
          if (maintenant >= dateFinFormation) {
            try {
              const { generateCertificate } = await import(
                "../../services/certificateService"
              );

              // Récupérer l'inscription complète avec les relations
              const inscriptionComplete = await prisma.inscription.findUnique({
                where: { id: inscription.id },
                include: {
                  utilisateur: true,
                  formation: true,
                },
              });

              if (inscriptionComplete) {
                const certificateData =
                  await generateCertificate(inscriptionComplete);

                // Créer l'attestation
                await prisma.attestation.create({
                  data: {
                    numero: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    urlPdf: certificateData.url,
                    statut: "GENEREE",
                    dateEmission: new Date(),
                    utilisateur: { connect: { id: utilisateurId } },
                    formation: { connect: { id: formationId } },
                    inscription: { connect: { id: inscription.id } },
                  },
                });

                console.log(
                  `Attestation générée automatiquement pour l'utilisateur ${utilisateurId}`
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la génération automatique de l'attestation:",
                error
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour du statut du paiement:",
          error
        );
      }
    }, 3000);

    res.status(201).json({
      message: "Paiement initié avec succès",
      reference: paiement.reference,
      statut: paiement.statut,
    });
  } catch (error) {
    console.error("Erreur lors de la création du paiement:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: errorMessage,
    });
  }
};

/**
 * Récupère le statut d'un paiement
 */
export const getStatutPaiement = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { reference },
      include: {
        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
          },
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Vérifier que l'utilisateur est autorisé à voir ce paiement
    if (req.user?.role !== "ADMIN" && paiement.utilisateurId !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à accéder à ce paiement" });
    }

    res.json(paiement);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du statut du paiement:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la récupération du statut du paiement",
      error: errorMessage,
    });
  }
};

/**
 * Liste les paiements d'un utilisateur
 */
export const listerPaiementsUtilisateur = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const utilisateurId = req.user.id;

    const paiements = await prisma.paiement.findMany({
      where: { utilisateurId },
      include: {
        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
          },
        },
      },
      orderBy: {
        datePaiement: "desc",
      },
    });

    res.json(paiements);
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: errorMessage,
    });
  }
};

/**
 * Télécharge le reçu PDF d'un paiement
 */
export const telechargerRecuPaiement = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { id } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { id },
      include: {
        formation: {
          select: { id: true, titre: true, prix: true },
        },
        utilisateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            telephone: true,
          },
        },
      },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    if (req.user.role !== "ADMIN" && paiement.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé à ce reçu" });
    }

    const pdfBuffer = await generatePaymentReceiptPdf({
      ...paiement,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="recu-${paiement.reference}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur lors du téléchargement du reçu:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return res.status(500).json({
      message: "Erreur lors de la génération du reçu",
      error: errorMessage,
    });
  }
};
