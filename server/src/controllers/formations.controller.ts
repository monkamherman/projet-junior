import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formationsController = {
  create: async (req: Request, res: Response) => {
    try {
      const formation = await prisma.formation.create({ data: req.body });
      return res.status(201).json(formation);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const formations = await prisma.formation.findMany();
    return res.status(200).json(formations);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(formation);
  },
};

export default formationsController;


