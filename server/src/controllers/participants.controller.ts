import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const participantsController = {
  create: async (req: Request, res: Response) => {
    try {
      const participant = await prisma.participant.create({ data: req.body });
      const { password, ...safe } = participant as any;
      return res.status(201).json(safe);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  },
  list: async (_req: Request, res: Response) => {
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        sexe: true,
        dateNaissance: true,
        lieuNaissance: true,
        telephone: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return res.status(200).json(participants);
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const participant = await prisma.participant.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        sexe: true,
        dateNaissance: true,
        lieuNaissance: true,
        telephone: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    if (!participant) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(participant);
  },
};

export default participantsController;


