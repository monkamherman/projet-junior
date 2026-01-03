"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genererPdfAttestation = exports.telechargerMonAttestation = exports.genererMonAttestation = exports.verifierEligibiliteAttestation = exports.getMesAttestations = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sendmail_1 = __importDefault(require("../../nodemailer/sendmail"));
const certificateService_1 = require("../../services/certificateService");
const prisma = new client_1.PrismaClient();
const getMesAttestations = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur lors de la récupération des attestations:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la récupération des attestations",
            error: errorMessage,
        });
    }
};
exports.getMesAttestations = getMesAttestations;
/**
 * Vérifier si une attestation peut être générée pour une formation
 */
const verifierEligibiliteAttestation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        const { formationId } = req.params;
        // 1. Vérifier si une inscription validée avec un paiement existe déjà
        const inscriptionValidee = await prisma.inscription.findFirst({
            where: {
                utilisateurId: req.user.id,
                formationId,
                statut: "VALIDEE",
                paiement: {
                    statut: "VALIDE",
                },
            },
            include: {
                formation: true,
                attestation: true,
            },
        });
        if (inscriptionValidee) {
            // Si une attestation existe déjà, l'utilisateur peut la télécharger
            if (inscriptionValidee.attestation) {
                return res.json({
                    eligible: false,
                    reason: "Attestation déjà disponible",
                    attestation: inscriptionValidee.attestation,
                });
            }
            // Si la formation n'est pas terminée
            const maintenant = new Date();
            const dateFinFormation = new Date(inscriptionValidee.formation.dateFin);
            if (maintenant < dateFinFormation) {
                return res.json({
                    eligible: false,
                    reason: `Formation en cours. Attestation disponible après le ${dateFinFormation.toLocaleDateString()}`,
                });
            }
            // Si le paiement est fait mais l'attestation pas encore générée (cas rare)
            return res.json({ eligible: true });
        }
        // 2. Vérifier si un paiement en attente ou en cours existe déjà pour éviter les doublons
        const paiementExistant = await prisma.paiement.findFirst({
            where: {
                utilisateurId: req.user.id,
                formationId,
                statut: { in: ["EN_ATTENTE", "EN_COURS"] },
            },
        });
        if (paiementExistant) {
            return res.json({
                eligible: false,
                reason: "Un paiement est déjà en cours de traitement.",
            });
        }
        // 3. Si aucune des conditions ci-dessus n'est remplie, l'utilisateur est éligible pour payer.
        res.json({ eligible: true });
    }
    catch (error) {
        console.error("Erreur lors de la vérification d'éligibilité:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la vérification d'éligibilité",
            error: errorMessage,
        });
    }
};
exports.verifierEligibiliteAttestation = verifierEligibiliteAttestation;
/**
 * Générer une attestation pour l'utilisateur connecté
 */
const genererMonAttestation = async (req, res) => {
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
        const certificateData = await (0, certificateService_1.generateCertificate)(inscription);
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
        // Envoyer l'email de notification
        try {
            const emailContent = `
Cher/Chère ${inscription.utilisateur.prenom} ${inscription.utilisateur.nom},

Félicitations ! Votre attestation de formation a été générée avec succès.

Détails de l'attestation :
- Numéro : ${attestation.numero}
- Formation : ${inscription.formation.titre}
- Date d'émission : ${attestation.dateEmission.toLocaleDateString("fr-FR")}
- URL du PDF : ${attestation.urlPdf}

Vous pouvez télécharger votre attestation directement depuis votre espace personnel.

Cordialement,
L'équipe Centic
      `;
            const emailResult = await (0, sendmail_1.default)(inscription.utilisateur.email, emailContent);
            if (emailResult.success) {
                console.log(`Email d'attestation envoyé avec succès à ${inscription.utilisateur.email}`);
            }
            else {
                console.error(`Erreur lors de l'envoi de l'email à ${inscription.utilisateur.email}:`, emailResult.error);
            }
        }
        catch (emailError) {
            console.error("Erreur lors de l'envoi de l'email d'attestation:", emailError);
            // Ne pas bloquer la réponse si l'email échoue
        }
        res.status(201).json({
            message: "Attestation générée avec succès",
            attestation,
        });
    }
    catch (error) {
        console.error("Erreur lors de la génération de l'attestation:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la génération de l'attestation",
            error: errorMessage,
        });
    }
};
exports.genererMonAttestation = genererMonAttestation;
/**
 * Télécharger son attestation
 */
const telechargerMonAttestation = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur lors du téléchargement de l'attestation:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors du téléchargement de l'attestation",
            error: errorMessage,
        });
    }
};
exports.telechargerMonAttestation = telechargerMonAttestation;
/**
 * Générer et télécharger un PDF d'attestation à la volée
 */
const genererPdfAttestation = async (req, res) => {
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
        // Générer le PDF à la volée
        const certificateData = await (0, certificateService_1.generateCertificate)(attestation.inscription);
        // Mettre à jour le statut de l'attestation
        await prisma.attestation.update({
            where: { id },
            data: {
                statut: "TELECHARGEE",
                dateTelechargement: new Date(),
            },
        });
        // Renvoyer le PDF généré
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="attestation-${attestation.numero}.pdf"`);
        // Si le service de certificat renvoie une URL, on récupère le fichier
        if (certificateData.url) {
            const filePath = path_1.default.join(__dirname, "../../public", certificateData.url.replace("/public", ""));
            if (fs_1.default.existsSync(filePath)) {
                const fileStream = fs_1.default.createReadStream(filePath);
                fileStream.pipe(res);
            }
            else {
                return res.status(404).json({ message: "Fichier PDF non trouvé" });
            }
        }
        else {
            return res
                .status(500)
                .json({ message: "Format de certificat non supporté" });
        }
    }
    catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la génération du PDF",
            error: errorMessage,
        });
    }
};
exports.genererPdfAttestation = genererPdfAttestation;
//# sourceMappingURL=attestation.controller.js.map