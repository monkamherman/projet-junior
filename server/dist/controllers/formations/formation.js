"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormations = getFormations;
exports.getFormationById = getFormationById;
exports.createFormation = createFormation;
exports.updateFormation = updateFormation;
exports.deleteFormation = deleteFormation;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getFormations(req, res) {
    try {
        const formations = await prisma.formation.findMany();
        res.json(formations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des formations." });
    }
}
async function getFormationById(req, res) {
    const { id } = req.params;
    try {
        const formation = await prisma.formation.findUnique({ where: { id } });
        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }
        res.json(formation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération de la formation." });
    }
}
async function createFormation(req, res) {
    const { titre, description, prix, dateDebut, dateFin, formateurId } = req.body;
    try {
        const newFormation = await prisma.formation.create({
            data: {
                titre,
                description,
                prix,
                dateDebut: new Date(dateDebut),
                dateFin: new Date(dateFin),
                formateurId,
            },
        });
        res.status(201).json(newFormation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la formation." });
    }
}
async function updateFormation(req, res) {
    const { id } = req.params;
    const { titre, description, prix, dateDebut, dateFin, formateurId } = req.body;
    try {
        const formation = await prisma.formation.findUnique({ where: { id } });
        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }
        const updatedFormation = await prisma.formation.update({
            where: { id },
            data: {
                titre,
                description,
                prix,
                dateDebut: new Date(dateDebut),
                dateFin: new Date(dateFin),
                formateurId,
            },
        });
        res.json(updatedFormation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la formation." });
    }
}
async function deleteFormation(req, res) {
    const { id } = req.params;
    try {
        const formation = await prisma.formation.findUnique({ where: { id } });
        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }
        await prisma.formation.delete({ where: { id } });
        res.json({ message: "Formation supprimée avec succès." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la formation." });
    }
}
//# sourceMappingURL=formation.js.map