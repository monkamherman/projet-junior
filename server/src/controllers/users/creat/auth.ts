import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function login(req: Request, res: Response) {
  console.log('Tentative de connexion avec:', { email: req.body.email });
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    console.error('Email ou mot de passe manquant');
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    console.log('Recherche de l\'utilisateur dans la base de données...');
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    
    if (!user) {
      console.error('Utilisateur non trouvé pour l\'email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    console.log('Utilisateur trouvé, vérification du mot de passe...');
    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);
    
    if (!validPassword) {
      console.error('Mot de passe incorrect pour l\'utilisateur:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    console.log('Création des tokens JWT...');
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET non défini');
      throw new Error('JWT_SECRET is not defined');
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('JWT_REFRESH_SECRET non défini');
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } as const
    ) as string;
    
    // Créer un refresh token
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' } as const
    ) as string;

    // Retourner les tokens et les informations utilisateur
    res.json({
      access: accessToken,
      refresh: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refresh } = req.body;

  if (!refresh) {
    return res.status(401).json({ message: "Refresh token manquant." });
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.error('JWT_REFRESH_SECRET non défini');
    return res.status(500).json({ message: "Erreur de configuration du serveur." });
  }

  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET) as { userId: string };
    
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET non défini');
      return res.status(500).json({ message: "Erreur de configuration du serveur." });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } as const
    ) as string;

    res.json({
      access: newAccessToken,
      user,
    });
  } catch (error) {
    console.error("Erreur de rafraîchissement du token:", error);
    return res.status(403).json({ message: "Token de rafraîchissement invalide ou expiré." });
  }
}

export async function logout(req: Request, res: Response) {
  // Pour JWT stateless, logout côté client suffit (supprimer le token)
  // Si vous avez un système de blacklist, ajoutez-le ici
  res.json({ message: "Déconnexion réussie." });
}
