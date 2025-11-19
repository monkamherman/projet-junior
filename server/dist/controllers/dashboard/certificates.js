"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCertificateByEmail = exports.downloadCertificate = exports.getAllCertificates = exports.generateCertificateForUser = void 0;
const client_1 = require("@prisma/client");
const certificateService_1 = require("../../services/certificateService");
const prisma = new client_1.PrismaClient();
// Générer une nouvelle attestation
const generateCertificateForUser = async (req, res) => {
    const { inscriptionId } = req.body;
    try {
        // Vérifier si l'inscription existe et est valide
        const inscription = await prisma.inscription.findUnique({
            where: { id: inscriptionId },
            include: {
                utilisateur: true,
                formation: true,
                paiement: true
            }
        });
        if (!inscription) {
            return res.status(404).json({ error: 'Inscription non trouvée' });
        }
        // Vérifier si le paiement est validé
        if (inscription.paiement?.statut !== 'SUCCES') {
            return res.status(400).json({ error: 'Le paiement doit être validé pour générer une attestation' });
        }
        // Vérifier si une attestation existe déjà
        const existingCertificate = await prisma.attestation.findFirst({
            where: { inscriptionId }
        });
        if (existingCertificate) {
            return res.status(400).json({ error: 'Une attestation existe déjà pour cette inscription' });
        }
        // Générer l'attestation (à implémenter dans le service)
        const certificateData = await (0, certificateService_1.generateCertificate)(inscription);
        // Enregistrer l'attestation dans la base de données
        const attestation = await prisma.attestation.create({
            data: {
                dateEmission: new Date(),
                statut: 'GENEREE',
                contenu: certificateData.content,
                url: certificateData.url,
                inscription: { connect: { id: inscriptionId } }
            },
            include: {
                inscription: {
                    include: {
                        utilisateur: true,
                        formation: true
                    }
                }
            }
        });
        res.status(201).json(attestation);
    }
    catch (error) {
        console.error('Erreur lors de la génération de l\'attestation:', error);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'attestation' });
    }
};
exports.generateCertificateForUser = generateCertificateForUser;
// Récupérer toutes les attestations
const getAllCertificates = async (req, res) => {
    try {
        const { startDate, endDate, statut } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.dateEmission = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        if (statut) {
            where.statut = statut;
        }
        const attestations = await prisma.attestation.findMany({
            where,
            include: {
                inscription: {
                    include: {
                        utilisateur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                email: true
                            }
                        },
                        formation: {
                            select: {
                                id: true,
                                titre: true,
                                dateDebut: true,
                                dateFin: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dateEmission: 'desc'
            }
        });
        res.json(attestations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des attestations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des attestations' });
    }
};
exports.getAllCertificates = getAllCertificates;
// Télécharger une attestation
const downloadCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        const attestation = await prisma.attestation.findUnique({
            where: { id },
            include: {
                inscription: {
                    include: {
                        utilisateur: true,
                        formation: true
                    }
                }
            }
        });
        if (!attestation) {
            return res.status(404).json({ error: 'Attestation non trouvée' });
        }
        // Mettre à jour le statut de l'attestation
        await prisma.attestation.update({
            where: { id },
            data: {
                statut: 'TELECHARGEE',
                dateTelechargement: new Date()
            }
        });
        // Retourner le fichier PDF de l'attestation
        res.download(attestation.url, `attestation-${attestation.id}.pdf`);
    }
    catch (error) {
        console.error('Erreur lors du téléchargement de l\'attestation:', error);
        res.status(500).json({ error: 'Erreur lors du téléchargement de l\'attestation' });
    }
};
exports.downloadCertificate = downloadCertificate;
// Envoyer une attestation par email
const sendCertificateByEmail = async (req, res) => {
    const { id } = req.params;
    try {
        const attestation = await prisma.attestation.findUnique({
            where: { id },
            include: {
                inscription: {
                    include: {
                        utilisateur: true,
                        formation: true
                    }
                }
            }
        });
        if (!attestation) {
            return res.status(404).json({ error: 'Attestation non trouvée' });
        }
        // Ici, vous devriez implémenter l'envoi d'email avec le lien de téléchargement
        // Par exemple, en utilisant Nodemailer ou un service tiers comme SendGrid
        // Mettre à jour le statut de l'attestation
        const updatedAttestation = await prisma.attestation.update({
            where: { id },
            data: {
                statut: 'ENVOYEE',
                dateEnvoi: new Date()
            },
            include: {
                inscription: {
                    include: {
                        utilisateur: true,
                        formation: true
                    }
                }
            }
        });
        res.json({
            message: 'Attestation envoyée avec succès',
            attestation: updatedAttestation
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'envoi de l\'attestation:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'attestation' });
    }
};
exports.sendCertificateByEmail = sendCertificateByEmail;
//# sourceMappingURL=certificates.js.map