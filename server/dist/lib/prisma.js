"use strict";
/**
 * Singleton PrismaClient pour optimiser les connexions à la base de données
 * Évite la création d'instances multiples et améliore les performances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = testDatabaseConnection;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
// Création du singleton PrismaClient
const prisma = globalThis.__prisma ||
    new client_1.PrismaClient({
        // Options de configuration pour optimiser les performances
        log: process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
        // Timeout de connexion plus court pour éviter les blocages
        transactionOptions: {
            timeout: 10000, // 10 secondes
        },
    });
// En développement, éviter les hot-reload issues
if (process.env.NODE_ENV === "development") {
    globalThis.__prisma = prisma;
}
// Fonction pour tester la connexion
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log("[DATABASE] Connexion à la base de données établie");
        return true;
    }
    catch (error) {
        console.error("[DATABASE] Erreur de connexion à la base de données:", error);
        return false;
    }
}
// Fonction de déconnexion propre
async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        console.log("[DATABASE] Déconnexion de la base de données");
    }
    catch (error) {
        console.error("[DATABASE] Erreur lors de la déconnexion:", error);
    }
}
// Export du singleton
exports.default = prisma;
//# sourceMappingURL=prisma.js.map