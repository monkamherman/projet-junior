import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer un nouveau paiement
export const createPayment = async (req: Request, res: Response) => {
  const { montant, modePaiement, statut, reference, inscriptionId } = req.body;
  
  try {
    const payment = await prisma.paiement.create({
      data: {
        montant: parseFloat(montant),
        modePaiement,
        statut,
        reference,
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
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};

// Récupérer tous les paiements
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, statut } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.datePaiement = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    if (statut) {
      where.statut = statut;
    }
    
    const payments = await prisma.paiement.findMany({
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
                prix: true
              }
            }
          }
        }
      },
      orderBy: {
        datePaiement: 'desc'
      }
    });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
  }
};

// Obtenir un paiement par ID
export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const payment = await prisma.paiement.findUnique({
      where: { id },
      include: {
        inscription: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true
              }
            },
            formation: {
              select: {
                id: true,
                titre: true,
                description: true,
                prix: true,
                dateDebut: true,
                dateFin: true
              }
            }
          }
        }
      }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du paiement' });
  }
};

// Mettre à jour le statut d'un paiement
export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { statut } = req.body;
  
  try {
    const updatedPayment = await prisma.paiement.update({
      where: { id },
      data: { statut },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true
          }
        }
      }
    });
    
    // Si le paiement est validé, mettre à jour le statut de l'inscription
    if (statut === 'SUCCES') {
      await prisma.inscription.update({
        where: { id: updatedPayment.inscriptionId },
        data: { statut: 'EN_COURS' }
      });
    }
    
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du paiement' });
  }
};
