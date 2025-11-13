import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import sendMail from "../../../nodemailer/sendmail";

const prisma = new PrismaClient();

// Fonction pour générer un OTP à 6 chiffres
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function signup(req: Request, res: Response) {
  try {
    const { nom, prenom, email, motDePasse, telephone, otp } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Vérifier OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        validated: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP invalide ou expiré." });
    }

    // Valider l'OTP
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { validated: true },
    });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur dans la base
    await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        motDePasse: hashedPassword,
        role: "APPRENANT",
      },
    });

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur." });
  }
}

export async function sendOTP(req: Request, res: Response) {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Générer OTP
    const otp = generateOTP();

    // Calculer expiration (ex: 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Stocker OTP dans la base
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
        validated: false,
      },
    });

    // Envoyer le mail avec l'OTP
    await sendMail(email, `Votre code de confirmation OTP est : ${otp}`);

    res.status(200).json({ message: "OTP envoyé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'OTP." });
  }
}
