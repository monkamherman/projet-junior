"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete";
async function login(req, res) {
    const { email, motDePasse } = req.body;
    try {
        const user = await prisma.utilisateur.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
        const validPassword = await bcrypt_1.default.compare(motDePasse, user.motDePasse);
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });
        // Créer un refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        // Retourner les tokens et les informations utilisateur
        res.json({
            access: accessToken,
            refresh: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
}
async function refreshToken(req, res) {
    const { refresh } = req.body;
    if (!refresh) {
        return res.status(401).json({ message: "Refresh token manquant." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refresh, JWT_SECRET);
        const user = await prisma.utilisateur.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        res.json({
            access: newAccessToken,
            user,
        });
    }
    catch (error) {
        console.error("Erreur de rafraîchissement du token:", error);
        return res.status(403).json({ message: "Token de rafraîchissement invalide ou expiré." });
    }
}
async function logout(req, res) {
    // Pour JWT stateless, logout côté client suffit (supprimer le token)
    // Si vous avez un système de blacklist, ajoutez-le ici
    res.json({ message: "Déconnexion réussie." });
}
//# sourceMappingURL=auth.js.map