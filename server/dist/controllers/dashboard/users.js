"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../../../core/database/prisma");
// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.prisma.utilisateur.findMany({
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
};
exports.getAllUsers = getAllUsers;
// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma_1.prisma.utilisateur.findUnique({
            where: { id },
            include: {
                inscriptions: {
                    include: {
                        formation: true,
                        attestation: true,
                    },
                },
                paiements: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};
exports.getUserById = getUserById;
// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, telephone, role } = req.body;
    try {
        const updatedUser = await prisma_1.prisma.utilisateur.update({
            where: { id },
            data: {
                nom,
                prenom,
                email,
                telephone,
                role,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};
exports.updateUser = updateUser;
// Désactiver un utilisateur
const deactivateUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.utilisateur.delete({
            where: { id },
        });
        res.json({ message: "Utilisateur désactivé avec succès" });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Erreur lors de la désactivation de l'utilisateur" });
    }
};
exports.deactivateUser = deactivateUser;
//# sourceMappingURL=users.js.map