"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.updatePassword = updatePassword;
exports.deleteUser = deleteUser;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function getProfile(req, res) {
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
        // Récupérer les formations de l'utilisateur (sans inclure la formation pour éviter les erreurs)
        const inscriptions = await prisma.inscription.findMany({
            where: {
                utilisateurId: req.user.id,
                statut: "VALIDEE",
            },
        });
        // Récupérer les formations séparément pour éviter les erreurs de null
        const formationIds = inscriptions.map((i) => i.formationId).filter(Boolean);
        const formationsData = await prisma.formation.findMany({
            where: {
                id: { in: formationIds },
            },
            include: {
                formateur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
        // Combiner les données
        const formations = formationsData.map((formation) => ({
            id: formation.id,
            titre: formation.titre,
            description: formation.description,
            dateDebut: formation.dateDebut,
            duree: Math.ceil((new Date(formation.dateFin).getTime() -
                new Date(formation.dateDebut).getTime()) /
                (1000 * 60 * 60 * 24)), // Durée en jours
            statut: new Date() > new Date(formation.dateFin)
                ? "TERMINÉ"
                : new Date() >= new Date(formation.dateDebut)
                    ? "EN_COURS"
                    : "NON_COMMENCÉ",
        }));
        // Récupérer les attestations de l'utilisateur
        const attestations = await prisma.attestation.findMany({
            where: {
                utilisateurId: req.user.id,
            },
            include: {
                inscription: {
                    include: {
                        formation: true,
                    },
                },
            },
        });
        // Récupérer les paiements de l'utilisateur
        const paiements = await prisma.paiement.findMany({
            where: {
                utilisateurId: req.user.id,
            },
            include: {
                inscriptions: {
                    include: {
                        formation: true,
                    },
                },
            },
            orderBy: {
                datePaiement: "desc",
            },
        });
        // Transformer les attestations
        const attestationsFormatted = attestations.map((attestation) => ({
            id: attestation.id,
            titre: `Attestation - ${attestation.inscription.formation.titre}`,
            formation: attestation.inscription.formation.titre,
            dateDelivrance: attestation.dateEmission,
        }));
        // Transformer les paiements
        const paiementsFormatted = paiements.map((paiement) => ({
            id: paiement.id,
            reference: paiement.reference,
            montant: paiement.montant,
            methode: paiement.mode,
            statut: paiement.statut,
            datePaiement: paiement.datePaiement,
            formation: paiement.inscriptions?.[0]?.formation?.titre || "Formation inconnue",
            telephone: paiement.telephone,
        }));
        // Combiner les données
        const profileData = {
            ...user,
            formations,
            attestations: attestationsFormatted,
            paiements: paiementsFormatted,
        };
        res.json(profileData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur lors de la récupération du profil.",
        });
    }
}
async function getUser(req, res) {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur lors de la récupération de l'utilisateur.",
        });
    }
}
async function updateUser(req, res) {
    const { id } = req.params;
    const { nom, prenom, email, telephone, motDePasse } = req.body;
    try {
        const user = await prisma.utilisateur.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        const dataToUpdate = {
            nom,
            prenom,
            email,
            telephone,
        };
        if (motDePasse) {
            dataToUpdate.motDePasse = await bcrypt_1.default.hash(motDePasse, 10);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur lors de la mise à jour de l'utilisateur.",
        });
    }
}
async function updatePassword(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé." });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Le mot de passe actuel et le nouveau mot de passe sont requis.",
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
        const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, user.motDePasse);
        if (!isCurrentPasswordValid) {
            return res
                .status(400)
                .json({ message: "Le mot de passe actuel est incorrect." });
        }
        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Mettre à jour le mot de passe
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: { motDePasse: hashedNewPassword },
        });
        res.json({ message: "Mot de passe mis à jour avec succès." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur lors de la mise à jour du mot de passe.",
        });
    }
}
async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        const user = await prisma.utilisateur.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        await prisma.utilisateur.delete({ where: { id } });
        res.json({ message: "Utilisateur supprimé avec succès." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur lors de la suppression de l'utilisateur.",
        });
    }
}
//# sourceMappingURL=user.js.map