import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete";

export async function login(req: Request, res: Response) {
  const { email, motDePasse } = req.body;

  try {
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!validPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

export async function logout(req: Request, res: Response) {
  // Pour JWT stateless, logout côté client suffit (supprimer le token)
  // Si vous avez un système de blacklist, ajoutez-le ici
  res.json({ message: "Déconnexion réussie." });
}
