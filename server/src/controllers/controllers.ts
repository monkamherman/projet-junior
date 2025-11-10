import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userController = {
    // Placeholder: évite les erreurs de typage tant que non utilisé
    getParticipants: async (_req: Request, res: Response)=> {
        const participants = await prisma.participant.findMany({
            select: { id: true, email: true, nom: true, prenom: true }
        })
        res.status(200).json(participants)
    }
}

export default userController