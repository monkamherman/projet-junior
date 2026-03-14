"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.annulerPaiement = exports.verifierStatutMonetbil = exports.monetbilWebhook = exports.telechargerRecuPaiementTxt = exports.telechargerRecuPaiement = exports.listerPaiementsUtilisateur = exports.getStatutPaiement = exports.creerPaiement = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const monetbil_service_1 = __importDefault(require("../../services/monetbil.service"));
const paymentReceipt_service_1 = require("../../services/paymentReceipt.service");
const prisma = new client_1.PrismaClient();
// Schéma de validation pour la création d'un paiement
const createPaiementSchema = zod_1.z.object({
    formationId: zod_1.z.string().min(1, "L'ID de la formation est requis"),
    montant: zod_1.z.number().min(0, "Le montant doit être positif"),
    telephone: zod_1.z.string().min(9, "Le numéro de téléphone est invalide"),
    operateur: zod_1.z.enum(["ORANGE_MONEY", "MTN_MONEY"]),
    mode: zod_1.z.enum(["ORANGE_MONEY", "MTN_MONEY", "CARTE", "ESPECES", "VIREMENT"]),
    code: zod_1.z.string().optional(),
    commentaire: zod_1.z.string().optional(),
});
/**
 * Crée un nouveau paiement avec intégration Monetbil
 * Flow complet: Création -> Appel Monetbil -> Retour URL de paiement
 */
const creerPaiement = async (req, res) => {
    try {
        // Vérifier l'authentification
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        // Valider les données de la requête
        console.log("[Paiement] Données reçues:", req.body);
        const validation = createPaiementSchema.safeParse(req.body);
        if (!validation.success) {
            console.log("[Paiement] Erreurs de validation:", validation.error.issues);
            return res.status(400).json({
                message: "Données invalides",
                errors: validation.error.issues,
            });
        }
        const { formationId, montant, telephone, operateur, mode, code, commentaire, } = validation.data;
        const utilisateurId = req.user.id;
        // Vérifier si l'utilisateur et la formation existent
        console.log("[Paiement] Vérification utilisateur et formation...");
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
            where: { utilisateurId, formationId },
        });
        if (inscriptionExistante) {
            return res.status(400).json({
                message: "Vous êtes déjà inscrit à cette formation. Vous pouvez accéder directement à votre attestation depuis votre espace.",
                alreadyEnrolled: true,
            });
        }
        // Créer une référence unique pour le paiement
        const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Créer le paiement en base avec statut EN_ATTENTE
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
        console.log("[Paiement] Paiement créé en base:", paiement.id);
        // Vérifier si Monetbil est configuré
        if (!monetbil_service_1.default.isConfigured()) {
            console.warn("[Paiement] Monetbil non configuré - mode simulation activé");
            // Mode simulation si Monetbil n'est pas configuré
            return res.status(201).json({
                message: "Paiement créé (mode simulation - Monetbil non configuré)",
                reference: paiement.reference,
                statut: paiement.statut,
                paiementId: paiement.id,
                simulation: true,
                note: "Configurez MONETBIL_API_KEY, MONETBIL_SERVICE_ID et MONETBIL_SERVICE_SECRET pour activer les paiements réels",
            });
        }
        // Appeler l'API Monetbil pour créer le paiement
        console.log("[Paiement] Appel à l'API Monetbil...");
        const monetbilResponse = await monetbil_service_1.default.createPayment(montant, telephone, reference, operateur, `Paiement formation: ${formation.titre}`);
        if (!monetbilResponse.success) {
            // Mettre à jour le statut du paiement en cas d'échec
            await prisma.paiement.update({
                where: { id: paiement.id },
                data: {
                    statut: "ECHEC",
                    monetbilStatus: "failed",
                    commentaire: monetbilResponse.error || "Erreur lors de l'appel Monetbil",
                },
            });
            return res.status(400).json({
                message: "Erreur lors de l'initialisation du paiement",
                error: monetbilResponse.error,
                reference: paiement.reference,
            });
        }
        // Mettre à jour le paiement avec les infos Monetbil
        await prisma.paiement.update({
            where: { id: paiement.id },
            data: {
                statut: "EN_COURS",
                monetbilTransactionId: monetbilResponse.transaction_id,
                monetbilPaymentUrl: monetbilResponse.payment_url,
                monetbilStatus: "pending",
            },
        });
        console.log("[Paiement] Paiement Monetbil créé avec succès:", {
            transactionId: monetbilResponse.transaction_id,
            paymentUrl: monetbilResponse.payment_url,
        });
        res.status(201).json({
            message: "Paiement initié avec succès",
            reference: paiement.reference,
            statut: "EN_COURS",
            paiementId: paiement.id,
            paymentUrl: monetbilResponse.payment_url,
            transactionId: monetbilResponse.transaction_id,
        });
    }
    catch (error) {
        console.error("[Paiement] Erreur lors de la création:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la création du paiement",
            error: errorMessage,
        });
    }
};
exports.creerPaiement = creerPaiement;
/**
 * Récupère le statut d'un paiement
 */
const getStatutPaiement = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur lors de la récupération du statut du paiement:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la récupération du statut du paiement",
            error: errorMessage,
        });
    }
};
exports.getStatutPaiement = getStatutPaiement;
/**
 * Liste les paiements d'un utilisateur
 */
const listerPaiementsUtilisateur = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        res.status(500).json({
            message: "Erreur lors de la récupération des paiements",
            error: errorMessage,
        });
    }
};
exports.listerPaiementsUtilisateur = listerPaiementsUtilisateur;
/**
 * Télécharge le reçu PDF d'un paiement
 */
const telechargerRecuPaiement = async (req, res) => {
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
        const pdfBuffer = await (0, paymentReceipt_service_1.generatePaymentReceiptPdf)({
            ...paiement,
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="recu-${paiement.reference}.pdf"`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error("Erreur lors du téléchargement du reçu:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return res.status(500).json({
            message: "Erreur lors de la génération du reçu",
            error: errorMessage,
        });
    }
};
exports.telechargerRecuPaiement = telechargerRecuPaiement;
/**
 * Télécharger le reçu de paiement en format TXT
 */
const telechargerRecuPaiementTxt = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        const { id } = req.params;
        const paiement = await prisma.paiement.findUnique({
            where: { id },
            include: {
                inscriptions: {
                    include: {
                        formation: true,
                    },
                },
            },
        });
        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        // Vérifier que l'utilisateur est bien le propriétaire
        if (paiement.utilisateurId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Non autorisé à accéder à ce paiement" });
        }
        // Générer le contenu du reçu en format TXT
        const recuContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              REÇU DE PAIEMENT                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date d'émission : ${new Date().toLocaleDateString("fr-FR")}
Référence       : ${paiement.reference}
Statut          : ${paiement.statut}

────────────────────────────────────────────────────────────────────────────────
DÉTAILS DU PAIEMENT
────────────────────────────────────────────────────────────────────────────────

Montant payé    : ${paiement.montant.toLocaleString("fr-FR")} FCFA
Méthode         : ${paiement.mode}
Téléphone       : ${paiement.telephone}
Date du paiement: ${paiement.datePaiement.toLocaleDateString("fr-FR")}

────────────────────────────────────────────────────────────────────────────────
FORMATION
────────────────────────────────────────────────────────────────────────────────

${paiement.inscriptions?.[0]?.formation?.titre || "Formation inconnue"}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS SUR L'ÉTUDIANT
────────────────────────────────────────────────────────────────────────────────

Nom complet     : ${req.user.prenom} ${req.user.nom}
Email          : ${req.user.email}
Téléphone      : ${req.user.telephone || "Non spécifié"}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS DE L'ORGANISME
────────────────────────────────────────────────────────────────────────────────

Nom            : CENTIC
Email          : contact@centic.com
Téléphone      : +225 00 00 00 00
Site web       : www.centic.com

────────────────────────────────────────────────────────────────────────────────
Mentions importantes
────────────────────────────────────────────────────────────────────────────────

• Ce reçu constitue la preuve de votre paiement
• Conservez-le précieusement pour toute réclamation
• Pour toute question, contactez notre service client
• Ce document a été généré électroniquement et est valide sans signature

╔══════════════════════════════════════════════════════════════════════════════╗
║                              MERCI POUR VOTRE CONFIANCE                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
`.trim();
        // Définir les headers pour le téléchargement
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="recu-paiement-${paiement.reference}.txt"`);
        res.send(recuContent);
    }
    catch (error) {
        console.error("Erreur lors du téléchargement du reçu:", error);
        res.status(500).json({
            message: "Erreur lors du téléchargement du reçu",
        });
    }
};
exports.telechargerRecuPaiementTxt = telechargerRecuPaiementTxt;
/**
 * Webhook Monetbil - Callback pour les notifications de paiement
 * Cette fonction est appelée par Monetbil après un paiement (succès ou échec)
 * Route publique (pas d'authentification requise - vérification par signature)
 */
const monetbilWebhook = async (req, res) => {
    console.log("[Webhook Monetbil] Réception d'un callback:", req.body);
    try {
        const webhookData = req.body;
        // Vérifier les données requises
        if (!webhookData.transaction_id || !webhookData.reference) {
            console.error("[Webhook Monetbil] Données manquantes:", webhookData);
            return res.status(400).json({ message: "Données de webhook invalides" });
        }
        // Vérifier la signature si présente (sécurité)
        if (webhookData.signature) {
            const isValid = monetbil_service_1.default.verifyWebhookSignature(webhookData, webhookData.signature);
            if (!isValid) {
                console.error("[Webhook Monetbil] Signature invalide");
                return res.status(401).json({ message: "Signature invalide" });
            }
        }
        // Trouver le paiement par référence
        const paiement = await prisma.paiement.findUnique({
            where: { reference: webhookData.reference },
            include: {
                formation: true,
                utilisateur: true,
            },
        });
        if (!paiement) {
            console.error("[Webhook Monetbil] Paiement non trouvé:", webhookData.reference);
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        console.log("[Webhook Monetbil] Statut reçu:", webhookData.status);
        // Mapper le statut Monetbil vers notre statut interne
        const statusMap = {
            success: "VALIDE",
            completed: "VALIDE",
            failed: "ECHEC",
            cancelled: "ANNULE",
            pending: "EN_COURS",
        };
        const nouveauStatut = statusMap[webhookData.status.toLowerCase()] || "EN_COURS";
        // Mettre à jour le paiement
        await prisma.paiement.update({
            where: { id: paiement.id },
            data: {
                statut: nouveauStatut,
                monetbilStatus: webhookData.status,
                monetbilTransactionId: webhookData.transaction_id,
                monetbilPhone: webhookData.phone,
                monetbilOperator: webhookData.operator,
                datePaiement: nouveauStatut === "VALIDE" ? new Date() : paiement.datePaiement,
            },
        });
        console.log("[Webhook Monetbil] Paiement mis à jour:", nouveauStatut);
        // Si le paiement est validé, créer l'inscription et potentiellement l'attestation
        if (nouveauStatut === "VALIDE") {
            await traiterPaiementValide(paiement);
        }
        // Répondre à Monetbil pour confirmer la réception
        res.status(200).json({
            message: "Webhook traité avec succès",
            reference: paiement.reference,
            statut: nouveauStatut,
        });
    }
    catch (error) {
        console.error("[Webhook Monetbil] Erreur:", error);
        res.status(500).json({
            message: "Erreur lors du traitement du webhook",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.monetbilWebhook = monetbilWebhook;
/**
 * Traite un paiement validé: crée l'inscription et l'attestation si nécessaire
 */
async function traiterPaiementValide(paiement) {
    try {
        console.log("[Paiement] Traitement du paiement validé:", paiement.id);
        // Vérifier si une inscription existe déjà
        const inscriptionExistante = await prisma.inscription.findFirst({
            where: {
                utilisateurId: paiement.utilisateurId,
                formationId: paiement.formationId,
            },
        });
        if (inscriptionExistante) {
            console.log("[Paiement] Inscription existante trouvée - mise à jour du statut");
            await prisma.inscription.update({
                where: { id: inscriptionExistante.id },
                data: {
                    statut: "VALIDEE",
                    paiementId: paiement.id,
                },
            });
            return;
        }
        // Créer l'inscription
        const inscription = await prisma.inscription.create({
            data: {
                dateInscription: new Date(),
                statut: "VALIDEE",
                utilisateur: { connect: { id: paiement.utilisateurId } },
                formation: { connect: { id: paiement.formationId } },
                paiement: { connect: { id: paiement.id } },
            },
        });
        console.log("[Paiement] Inscription créée:", inscription.id);
        // Vérifier si la formation est terminée pour générer l'attestation
        const maintenant = new Date();
        const dateFinFormation = new Date(paiement.formation.dateFin);
        if (maintenant >= dateFinFormation) {
            console.log("[Paiement] Formation terminée - génération de l'attestation");
            await genererAttestation(paiement, inscription);
        }
    }
    catch (error) {
        console.error("[Paiement] Erreur lors du traitement du paiement validé:", error);
        throw error;
    }
}
/**
 * Génère une attestation pour un paiement validé
 */
async function genererAttestation(paiement, inscription) {
    try {
        const { generateCertificate } = await Promise.resolve().then(() => __importStar(require("../../services/certificateService")));
        // Récupérer l'inscription complète avec les relations
        const inscriptionComplete = await prisma.inscription.findUnique({
            where: { id: inscription.id },
            include: {
                utilisateur: true,
                formation: true,
            },
        });
        if (!inscriptionComplete) {
            console.error("[Paiement] Inscription non trouvée pour l'attestation");
            return;
        }
        const certificateData = await generateCertificate(inscriptionComplete);
        // Créer l'attestation
        await prisma.attestation.create({
            data: {
                numero: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                urlPdf: certificateData.url,
                statut: "GENEREE",
                dateEmission: new Date(),
                utilisateur: { connect: { id: paiement.utilisateurId } },
                formation: { connect: { id: paiement.formationId } },
                inscription: { connect: { id: inscription.id } },
            },
        });
        console.log("[Paiement] Attestation générée avec succès");
    }
    catch (error) {
        console.error("[Paiement] Erreur lors de la génération de l'attestation:", error);
    }
}
/**
 * Vérifie manuellement le statut d'un paiement Monetbil
 * Utile pour les cas où le webhook n'a pas été reçu
 */
const verifierStatutMonetbil = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        const { reference } = req.params;
        const paiement = await prisma.paiement.findUnique({
            where: { reference },
        });
        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        // Vérifier l'autorisation
        if (req.user.role !== "ADMIN" && paiement.utilisateurId !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        // Si pas de transaction Monetbil, retourner le statut actuel
        if (!paiement.monetbilTransactionId) {
            return res.json({
                message: "Paiement sans transaction Monetbil",
                statut: paiement.statut,
                reference: paiement.reference,
            });
        }
        // Vérifier le statut auprès de Monetbil
        console.log("[Paiement] Vérification statut Monetbil:", paiement.monetbilTransactionId);
        const statusMonetbil = await monetbil_service_1.default.checkTransactionStatus(paiement.monetbilTransactionId);
        if (!statusMonetbil) {
            return res.json({
                message: "Impossible de récupérer le statut Monetbil",
                statut: paiement.statut,
                reference: paiement.reference,
            });
        }
        // Mettre à jour le statut si différent
        const statusMap = {
            success: "VALIDE",
            completed: "VALIDE",
            failed: "ECHEC",
            cancelled: "ANNULE",
            pending: "EN_COURS",
        };
        const nouveauStatut = statusMap[statusMonetbil.status] || paiement.statut;
        if (nouveauStatut !== paiement.statut) {
            await prisma.paiement.update({
                where: { id: paiement.id },
                data: {
                    statut: nouveauStatut,
                    monetbilStatus: statusMonetbil.status,
                    monetbilPhone: statusMonetbil.phone,
                    monetbilOperator: statusMonetbil.operator,
                },
            });
            // Si validé, traiter
            if (nouveauStatut === "VALIDE") {
                const paiementComplet = await prisma.paiement.findUnique({
                    where: { id: paiement.id },
                    include: { formation: true, utilisateur: true },
                });
                if (paiementComplet) {
                    await traiterPaiementValide(paiementComplet);
                }
            }
        }
        res.json({
            message: "Statut vérifié",
            reference: paiement.reference,
            statut: nouveauStatut,
            statutMonetbil: statusMonetbil.status,
            transactionId: paiement.monetbilTransactionId,
        });
    }
    catch (error) {
        console.error("[Paiement] Erreur vérification statut:", error);
        res.status(500).json({
            message: "Erreur lors de la vérification du statut",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.verifierStatutMonetbil = verifierStatutMonetbil;
/**
 * Annule un paiement en cours
 */
const annulerPaiement = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        const { reference } = req.params;
        const paiement = await prisma.paiement.findUnique({
            where: { reference },
        });
        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        // Vérifier l'autorisation
        if (paiement.utilisateurId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Non autorisé" });
        }
        // Vérifier si le paiement peut être annulé
        if (paiement.statut === "VALIDE") {
            return res.status(400).json({
                message: "Ce paiement est déjà validé et ne peut pas être annulé",
            });
        }
        // Mettre à jour le statut
        await prisma.paiement.update({
            where: { id: paiement.id },
            data: {
                statut: "ANNULE",
                monetbilStatus: "cancelled",
            },
        });
        res.json({
            message: "Paiement annulé avec succès",
            reference: paiement.reference,
            statut: "ANNULE",
        });
    }
    catch (error) {
        console.error("[Paiement] Erreur annulation:", error);
        res.status(500).json({
            message: "Erreur lors de l'annulation du paiement",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.annulerPaiement = annulerPaiement;
//# sourceMappingURL=paiement.controller.js.map