"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Récupérer les statistiques du tableau de bord
const getDashboardStats = async (req, res) => {
    try {
        // Récupérer le nombre d'utilisateurs
        const usersCount = await prisma.utilisateur.count();
        // Récupérer le nombre de formations
        const formationsCount = await prisma.formation.count();
        // Récupérer le nombre de paiements
        const paymentsCount = await prisma.paiement.count();
        // Récupérer le nombre d'attestations
        const certificatesCount = await prisma.attestation.count();
        res.json({
            users: usersCount,
            formations: formationsCount,
            payments: paymentsCount,
            certificates: certificatesCount,
        });
    }
    catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des statistiques" });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=stats.js.map