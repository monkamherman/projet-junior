import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dispensesController = {
  create: async (req: Request, res: Response) => {
    try {
      const dispense = await prisma.dispense.create({ data: req.body });
      return res.status(201).json(dispense);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const dispenses = await prisma.dispense.findMany();
    return res.status(200).json(dispenses);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const dispense = await prisma.dispense.findUnique({ where: { id } });
    if (!dispense) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(dispense);
  },
};

export default dispensesController;


