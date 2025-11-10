import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const inscriptionsController = {
  create: async (req: Request, res: Response) => {
    try {
      const inscription = await prisma.inscription.create({ data: req.body });
      return res.status(201).json(inscription);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const inscriptions = await prisma.inscription.findMany();
    return res.status(200).json(inscriptions);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const inscription = await prisma.inscription.findUnique({ where: { id } });
    if (!inscription) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(inscription);
  },
};

export default inscriptionsController;


