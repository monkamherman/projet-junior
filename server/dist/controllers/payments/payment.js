"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
const prisma_1 = require("../../../core/database/prisma");
async function createPayment(req, res) {
    const { inscriptionId, reference, montant, mode, commentaire } = req.body;
    try {
        // Vérifier que l'inscription existe
        const inscription = await prisma_1.prisma.inscription.findUnique({
            where: { id: inscriptionId },
        });
        if (!inscription) {
            return res.status(404).json({ message: "Inscription non trouvée." });
        }
        // Créer le paiement
        const payment = await prisma_1.prisma.paiement.create({
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
        await prisma_1.prisma.inscription.update({
            where: { id: inscriptionId },
            data: { statut: "VALIDEE" },
        });
        // TODO: Débloquer l'accès à l'attestation (logique à implémenter selon besoin)
        res.status(201).json(payment);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la création du paiement." });
    }
}
async function getPayments(req, res) {
    try {
        const payments = await prisma_1.prisma.paiement.findMany();
        res.json(payments);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des paiements." });
    }
}
async function getPaymentById(req, res) {
    const { id } = req.params;
    try {
        const payment = await prisma_1.prisma.paiement.findUnique({ where: { id } });
        if (!payment) {
            return res.status(404).json({ message: "Paiement non trouvé." });
        }
        res.json(payment);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération du paiement." });
    }
}
async function updatePayment(req, res) {
    const { id } = req.params;
    const { reference, montant, mode, statut, commentaire } = req.body;
    try {
        const payment = await prisma_1.prisma.paiement.findUnique({ where: { id } });
        if (!payment) {
            return res.status(404).json({ message: "Paiement non trouvé." });
        }
        const updatedPayment = await prisma_1.prisma.paiement.update({
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
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la mise à jour du paiement." });
    }
}
async function deletePayment(req, res) {
    const { id } = req.params;
    try {
        const payment = await prisma_1.prisma.paiement.findUnique({ where: { id } });
        if (!payment) {
            return res.status(404).json({ message: "Paiement non trouvé." });
        }
        await prisma_1.prisma.paiement.delete({ where: { id } });
        res.json({ message: "Paiement supprimé avec succès." });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la suppression du paiement." });
    }
}
//# sourceMappingURL=payment.js.map