"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authMiddleware = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ message: "Token d'authentification manquant ou invalide" });
        }
        const token = authHeader.split(" ")[1];
        // Vérifier que la clé secrète est définie
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res
                .status(500)
                .json({ message: "Erreur de configuration du serveur" });
        }
        // Vérifier et décoder le token
        console.log("Tentative de vérification du token JWT...");
        console.log("Token reçu:", token.substring(0, 20) + "...");
        console.log("JWT_SECRET défini:", process.env.JWT_SECRET ? "Oui" : "Non");
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log("Token décodé avec succès, userId:", decoded.userId);
        }
        catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res
                    .status(401)
                    .json({ message: "Session expirée, veuillez vous reconnecter" });
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: "Token invalide" });
            }
            return res
                .status(500)
                .json({ message: "Erreur de vérification du token" });
        }
        // Récupérer l'utilisateur depuis la base de données
        console.log("Récupération de l'utilisateur avec ID:", decoded.userId);
        const user = await prisma.utilisateur.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                telephone: true,
            },
        });
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }
        // Ajouter l'utilisateur à l'objet request
        req.user = user;
        // Passer au middleware ou au contrôleur suivant
        next();
    }
    catch (error) {
        console.error("Erreur d'authentification:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res
                .status(401)
                .json({ message: "Session expirée, veuillez vous reconnecter" });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Token invalide" });
        }
        res.status(500).json({ message: "Erreur d'authentification" });
    }
};
exports.authMiddleware = authMiddleware;
// Export par défaut pour compatibilité
exports.default = exports.authMiddleware;
/**
 * Middleware pour vérifier les rôles
 * Vérifie si l'utilisateur a le rôle requis pour accéder à la ressource
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource",
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=auth.middleware.js.map