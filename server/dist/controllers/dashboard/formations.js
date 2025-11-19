"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFormation = exports.updateFormation = exports.getFormationById = exports.getAllFormations = exports.createFormation = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Créer une nouvelle formation
const createFormation = async (req, res) => {
    const { titre, description, prix, dateDebut, dateFin, formateurId } = req.body;
    try {
        const formation = await prisma.formation.create({
            data: {
                titre,
                description,
                prix: parseFloat(prix),
                dateDebut: new Date(dateDebut),
                dateFin: new Date(dateFin),
                formateur: formateurId ? { connect: { id: formateurId } } : undefined,
            },
        });
        res.status(201).json(formation);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la formation' });
    }
};
exports.createFormation = createFormation;
// Récupérer toutes les formations
const getAllFormations = async (req, res) => {
    try {
        const formations = await prisma.formation.findMany({
            include: {
                formateur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        inscriptions: true
                    }
                }
            },
            orderBy: {
                dateDebut: 'desc'
            }
        });
        res.json(formations);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
    }
};
exports.getAllFormations = getAllFormations;
// Obtenir une formation par ID
const getFormationById = async (req, res) => {
    const { id } = req.params;
    try {
        const formation = await prisma.formation.findUnique({
            where: { id },
            include: {
                formateur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true
                    }
                },
                inscriptions: {
                    include: {
                        utilisateur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                email: true
                            }
                        },
                        statut: true
                    }
                }
            }
        });
        if (!formation) {
            return res.status(404).json({ error: 'Formation non trouvée' });
        }
        res.json(formation);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
    }
};
exports.getFormationById = getFormationById;
// Mettre à jour une formation
const updateFormation = async (req, res) => {
    const { id } = req.params;
    const { titre, description, prix, dateDebut, dateFin, statut, formateurId } = req.body;
    try {
        const updatedFormation = await prisma.formation.update({
            where: { id },
            data: {
                titre,
                description,
                prix: prix ? parseFloat(prix) : undefined,
                dateDebut: dateDebut ? new Date(dateDebut) : undefined,
                dateFin: dateFin ? new Date(dateFin) : undefined,
                statut,
                formateur: formateurId ? { connect: { id: formateurId } } : undefined,
            },
        });
        res.json(updatedFormation);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la formation' });
    }
};
exports.updateFormation = updateFormation;
// Supprimer une formation
const deleteFormation = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.formation.delete({
            where: { id }
        });
        res.json({ message: 'Formation supprimée avec succès' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la formation' });
    }
};
exports.deleteFormation = deleteFormation;
//# sourceMappingURL=formations.js.map