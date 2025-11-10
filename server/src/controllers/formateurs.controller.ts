import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formateursController = {
  create: async (req: Request, res: Response) => {
    try {
      const formateur = await prisma.formateur.create({ data: req.body });
      return res.status(201).json(formateur);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const formateurs = await prisma.formateur.findMany();
    return res.status(200).json(formateurs);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const formateur = await prisma.formateur.findUnique({ where: { id } });
    if (!formateur) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(formateur);
  },
};

export default formateursController;


