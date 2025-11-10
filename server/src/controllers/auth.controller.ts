import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

const authController = {
  signup: async (req: Request, res: Response) => {
    const { email, password, nom, prenom, sexe, dateNaissance, lieuNaissance, telephone } = req.body as any;
    if (!email || !password || !nom || !prenom || !sexe || !dateNaissance || !lieuNaissance || !telephone) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const existing = await prisma.participant.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const participant = await prisma.participant.create({
      data: {
        email,
        password: hashed,
        nom,
        prenom,
        sexe,
        dateNaissance: new Date(dateNaissance),
        lieuNaissance,
        telephone,
      },
    });
    const token = signToken({ sub: participant.id, email: participant.email, role: participant.role });
    return res.status(201).json({ token, user: { id: participant.id, email: participant.email, role: participant.role } });
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email et password requis' });
    }
    const participant = await prisma.participant.findUnique({ where: { email } });
    if (!participant) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const ok = await bcrypt.compare(password, participant.password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const token = signToken({ sub: participant.id, email: participant.email, role: participant.role });
    return res.status(200).json({ token, user: { id: participant.id, email: participant.email, role: participant.role } });
  },

  me: async (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    const token = auth.substring(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
      const participant = await prisma.participant.findUnique({ where: { id: payload.sub } });
      if (!participant) return res.status(404).json({ message: 'Utilisateur introuvable' });
      return res.status(200).json({ id: participant.id, email: participant.email, role: participant.role });
    } catch {
      return res.status(401).json({ message: 'Token invalide' });
    }
  },

  logout: async (_req: Request, res: Response) => {
    // Avec JWT stateless, on renvoie simplement 200 côté serveur.
    return res.status(200).json({ message: 'Déconnecté' });
  },
};

export default authController;


