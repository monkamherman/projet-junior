"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { colorize, align } = winston_1.format;
// Fonction de configuration pour la rotation quotidienne des fichiers de logs
const createTransport = (filename, level, maxFiles) => {
    return new winston_daily_rotate_file_1.default({
        filename: `logs/${filename}-%DATE%.log`, // Nom du fichier basé sur le niveau
        datePattern: 'YYYY-MM-DD', // Format de la date
        zippedArchive: true, // Archiver les anciens fichiers en zip
        maxSize: '30m', // Taille maximale du fichier de log
        maxFiles: `${maxFiles}d`, // Nombre maximum de jours à conserver
        level // Niveau de log (si spécifié)
    });
};
// Definir le niveau de log en fonction de l'environement... Ceci pour filtrer certains log et ne pas les envoyer en production 
const logLevel = envs.NODE_ENV === 'production' ? 'info' : 'debug';
// Transporteur pour les log généraux
const transport = createTransport('application', 'info', 14);
// Transporteur pour les log de warn
const warnTransport = createTransport('warns', 'warn', 21);
// Transporteur pour les log de debug
const debugTransport = createTransport('debugs', 'debug', 21);
// Transporteur pour les log d'erreur
const errorTransport = createTransport('errors', 'error', 30);
/**
 * Crée un logger Winston configuré pour enregistrer les logs dans des fichiers avec rotation quotidienne.
 * Gère à la fois les logs généraux, les logs de warning et les logs d'erreurs.
 * Les exceptions non capturées et les promesses rejetées sont également traitées.
 */
const log = (0, winston_1.createLogger)({
    level: logLevel,
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss' // Format de la date dans les fichiers
    }), winston_1.format.errors({ stack: true }), // pour afficher les stacks des erreurs
    align(), //method aligns the log messages
    envs.NODE_ENV === 'production' // gerer l'affichage des logs en fonction de l'environnement de dévéloppement
        ? winston_1.format.json() // Production : logs au format JSON
        : winston_1.format.prettyPrint() // Développement : logs plus lisibles
    ),
    defaultMeta: {
        service: 'user-service'
    },
    transports: [
        envs.NODE_ENV === 'production' ?
            new winston_1.transports.Console({
                format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json() // JSON output pour la console aussi
                ),
                level: 'info' // On affiche seulement 'info' et supérieur en production
            })
            :
                new winston_1.transports.Console({
                    format: winston_1.format.combine(colorize({ all: true }), winston_1.format.printf(({ level, message, timestamp }) => {
                        return `${timestamp} [${level}]: ${message}`;
                    })),
                    level: 'debug' // On affiche tous les niveaux en développement
                }), // pour afficher les logs dans la console
        transport, // Logs généraux avec rotation quotidienne
        errorTransport, // Fichier dédié pour les error avec rotation
        warnTransport, // Fichier dédié pour les warn avec rotation
        debugTransport, // Fichier dédié pour les warn avec rotation
    ],
    exceptionHandlers: [
        new winston_1.transports.File({ filename: 'logs/exceptions.log' }) // Capture les exceptions non interceptées pour éviter que l'application ne se termine de manière inattendue
    ],
    rejectionHandlers: [
        new winston_1.transports.File({ filename: 'logs/rejections.log' }) // Capture les promesses rejetées
    ]
});
exports.default = log;
//# sourceMappingURL=logger.js.map