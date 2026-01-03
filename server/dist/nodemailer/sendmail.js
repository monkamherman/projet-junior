"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../core/config/env");
// Cache du transporteur SMTP pour éviter les recréations
let transporter = null;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
// Créer le transporteur SMTP avec timeout
const createTransporter = async () => {
    const now = Date.now();
    // Réutiliser le transporteur existant si disponible et récent
    if (transporter && now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
        console.log("[EMAIL] Réutilisation du transporteur SMTP existant");
        return transporter;
    }
    console.log("[EMAIL] Création d'un nouveau transporteur SMTP...");
    lastConnectionAttempt = now;
    transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: env_1.envs.address_mail,
            pass: env_1.envs.mot_de_passe,
        },
        tls: {
            rejectUnauthorized: false,
        },
        // Timeout plus courts pour éviter les blocages
        connectionTimeout: 10000, // 10 secondes
        greetingTimeout: 5000, // 5 secondes
        socketTimeout: 10000, // 10 secondes
        debug: false, // Désactiver en production pour les performances
        logger: false, // Désactiver en production
    });
    // Vérifier la connexion
    await transporter.verify();
    console.log("[EMAIL] Transporteur SMTP vérifié et prêt");
    return transporter;
};
const sendMail = async (email, text) => {
    console.log(`[EMAIL] Tentative d'envoi d'email à: ${email}`);
    // Vérifier si les identifiants SMTP sont configurés
    if (!env_1.envs.address_mail ||
        !env_1.envs.mot_de_passe ||
        env_1.envs.address_mail === "cesaristos85@gmail.com" ||
        env_1.envs.mot_de_passe === "ybfm tkhc pyaa bmuy") {
        console.log(`[EMAIL] Configuration SMTP non trouvée ou utilise les valeurs par défaut`);
        console.log(`[EMAIL] === DÉBUT MODE DÉMO ===`);
        console.log(`[EMAIL] Email destinataire: ${email}`);
        console.log(`[EMAIL] Contenu du message:`);
        console.log(text);
        console.log(`[EMAIL] === FIN MODE DÉMO ===`);
        // Extraire le code OTP du message pour le retourner
        const otpMatch = text.match(/(\d{6})/);
        const otpCode = otpMatch ? otpMatch[1] : null;
        if (otpCode) {
            console.log(`[EMAIL] CODE OTP POUR TEST: ${otpCode}`);
        }
        return {
            success: true,
            messageId: `demo-${Date.now()}`,
            otpCode: otpCode || undefined,
        };
    }
    try {
        const transporter = await Promise.race([
            createTransporter(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout de connexion SMTP")), 15000)),
        ]);
        console.log("[EMAIL] Préparation des options d'envoi...");
        const mailOptions = {
            from: `"Équipe Centic" <${env_1.envs.address_mail}>`,
            to: email,
            subject: "Votre code de vérification",
            text: text,
        };
        console.log("[EMAIL] Envoi de l'email en cours...");
        const info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout d'envoi d'email")), 20000)),
        ]);
        console.log(`[EMAIL] Email envoyé avec succès à ${email}. ID du message: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error(`[EMAIL] Erreur lors de l'envoi de l'email à ${email}:`, errorMessage);
        // Réinitialiser le transporteur en cas d'erreur
        if (errorMessage.includes("timeout") ||
            errorMessage.includes("connection")) {
            transporter = null;
            console.log("[EMAIL] Transporteur réinitialisé suite à une erreur de connexion");
        }
        return {
            success: false,
            error: errorMessage,
        };
    }
};
exports.default = sendMail;
//# sourceMappingURL=sendmail.js.map