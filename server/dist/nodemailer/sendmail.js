"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../core/config/env");
const sendMail = async (email, text) => {
    console.log(`[EMAIL] Tentative d'envoi d'email à: ${email}`);
    try {
        console.log('[EMAIL] Configuration du transporteur SMTP...');
        const transporter = nodemailer_1.default.createTransport({
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
            debug: true, // Active les logs de débogage détaillés
            logger: true // Active la journalisation
        });
        console.log('[EMAIL] Préparation des options d\'envoi...');
        const mailOptions = {
            from: `"Équipe Centic" <${env_1.envs.address_mail}>`,
            to: email,
            subject: "Votre code de vérification",
            text: text,
        };
        console.log('[EMAIL] Envoi de l\'email en cours...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Email envoyé avec succès à ${email}. ID du message: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`[EMAIL] Erreur lors de l'envoi de l'email à ${email}:`, errorMessage);
        console.error('Détails de l\'erreur:', error);
        return {
            success: false,
            error: errorMessage
        };
    }
};
exports.default = sendMail;
//# sourceMappingURL=sendmail.js.map