import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parlementsController = {
  create: async (req: Request, res: Response) => {
    try {
      const parlement = await prisma.parlement.create({ data: req.body });
      return res.status(201).json(parlement);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const parlements = await prisma.parlement.findMany();
    return res.status(200).json(parlements);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const parlement = await prisma.parlement.findUnique({ where: { id } });
    if (!parlement) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(parlement);
  },
};

export default parlementsController;


