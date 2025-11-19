"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = generateCertificate;
exports.canDownloadCertificate = canDownloadCertificate;
const client_1 = require("@prisma/client");
const fs_1 = require("fs");
const path_1 = require("path");
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
const fr_1 = require("date-fns/locale/fr");
const prisma = new client_1.PrismaClient();
function generateCertificate(inscription) {
    return new Promise((resolve, reject) => {
        try {
            const { utilisateur, formation } = inscription;
            // Créer un nouveau document PDF
            const doc = new pdfkit_1.default({
                size: 'A4',
                layout: 'landscape',
                margin: 50
            });
            // Générer un nom de fichier unique
            const fileName = `attestation-${inscription.id}.pdf`;
            const filePath = (0, path_1.join)(__dirname, '../../public/certificates', fileName);
            const fileUrl = `/certificates/${fileName}`;
            // Créer un flux d'écriture vers le fichier
            const stream = (0, fs_1.createWriteStream)(filePath);
            // Configurer le document PDF
            doc.pipe(stream);
            // Ajouter un fond de page
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
            // Ajouter un en-tête avec le logo (à personnaliser)
            doc
                .fill('#2c3e50')
                .fontSize(24)
                .text('ATTESTATION DE FORMATION', { align: 'center', underline: true })
                .moveDown(2);
            // Ajouter le contenu de l'attestation
            doc
                .fill('#2c3e50')
                .fontSize(16)
                .text('Le responsable de la formation,', { align: 'right' })
                .moveDown(2)
                .text('Déclare que :', { align: 'center' })
                .moveDown(1);
            // Nom et prénom en plus grand
            doc
                .fontSize(20)
                .text(`${utilisateur.prenom} ${utilisateur.nom}`, { align: 'center', underline: true })
                .moveDown(1)
                .fontSize(16);
            // Détails de la formation
            doc
                .text(`a suivi avec succès la formation intitulée :`, { align: 'center' })
                .moveDown(1)
                .fontSize(18)
                .text(`« ${formation.titre} »`, { align: 'center', underline: true })
                .moveDown(1)
                .fontSize(16);
            // Période de formation
            const dateDebut = (0, date_fns_1.format)(new Date(formation.dateDebut), 'dd MMMM yyyy', { locale: fr_1.fr });
            const dateFin = (0, date_fns_1.format)(new Date(formation.dateFin), 'dd MMMM yyyy', { locale: fr_1.fr });
            doc
                .text(`du ${dateDebut} au ${dateFin}.`, { align: 'center' })
                .moveDown(3);
            // Signature
            doc
                .text('Fait à [Ville], le ' + (0, date_fns_1.format)(new Date(), 'dd/MM/yyyy', { locale: fr_1.fr }), { align: 'right' })
                .moveDown(2)
                .text('Le responsable de la formation', { align: 'right' })
                .moveDown(0.5)
                .text('__________________________', { align: 'right' });
            // Ajouter un pied de page
            const bottom = doc.page.height - 50;
            doc
                .fontSize(10)
                .fill('#7f8c8d')
                .text('Formation éligible au Compte Personnel de Formation (CPF)', 50, bottom, { align: 'center' });
            // Finaliser le document
            doc.end();
            // Attendre que l'écriture soit terminée
            stream.on('finish', () => {
                resolve({
                    content: `Attestation de formation pour ${utilisateur.prenom} ${utilisateur.nom}`,
                    url: fileUrl
                });
            });
        }
        catch (error) {
            console.error('Erreur lors de la génération du certificat:', error);
            reject(error);
        }
    });
}
// Vérifier si un utilisateur a le droit de télécharger une attestation
async function canDownloadCertificate(userId, certificateId) {
    try {
        const attestation = await prisma.attestation.findUnique({
            where: { id: certificateId },
            include: {
                inscription: {
                    select: {
                        utilisateurId: true
                    }
                }
            }
        });
        // Vérifier si l'utilisateur est le propriétaire de l'attestation ou un administrateur
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        return (attestation?.inscription.utilisateurId === userId ||
            user?.role === 'ADMIN' ||
            user?.role === 'FORMATEUR');
    }
    catch (error) {
        console.error('Erreur lors de la vérification des droits de téléchargement:', error);
        return false;
    }
}
//# sourceMappingURL=certificateService.js.map