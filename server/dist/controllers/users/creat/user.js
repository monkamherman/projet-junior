"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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