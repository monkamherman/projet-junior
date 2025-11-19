"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_1 = require("./env");
const winston_mongodb_1 = require("winston-mongodb");
const { colorize, align } = winston_1.default.format;
// Definir le niveau de log en fonction de l'environement... Ceci pour filtrer certains log et ne pas les envoyer en production 
const logLevel = env_1.envs.NODE_ENV === 'production' ? 'warn' : 'debug';
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
// Transporteur pour les log généraux
const transport = createTransport('application', 'info', 14);
// Transporteur pour les log de warn
const warnTransport = createTransport('warns', 'warn', 21);
// Transporteur pour les log de debug
const debugTransport = createTransport('debugs', 'debug', 21);
// Transporteur pour les log d'erreur
const errorTransport = createTransport('errors', 'error', 30);
// Configuration du transporteur MongoDB
const mongoTransport = new winston_mongodb_1.MongoDB({
    db: env_1.envs.DATABASE_URL, // URL de connexion à la base de données
    options: {
        maxPoolSize: 200, // nombre de pool de connion simultanée sur mongo
    },
    collection: 'Log', // Collection MongoDB où les logs seront enregistrés
    level: logLevel, // Niveau de log en fonction de l'environnement
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json() // Stockage des logs au format JSON dans MongoDB pour une meilleure lisibilité
    ),
    tryReconnect: true, // Tente de se reconnecter en cas de perte de connexion
    capped: true, // Utilise un collection capped pour limiter la taille et la gestion des logs
    cappedSize: 20000000, // Taille maximale de la collection en octets (ici 20 Mo)
    cappedMax: 1500, // Nombre maximal de documents (ici 1000 documents)
});
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
    env_1.envs.NODE_ENV === 'production' // gerer l'affichage des logs en fonction de l'environnement de dévéloppement
        ? winston_1.format.json() // Production : logs au format JSON
        : winston_1.format.prettyPrint() // Développement : logs plus lisibles
    ),
    defaultMeta: {
        service: 'user-service'
    },
    transports: [
        env_1.envs.NODE_ENV === 'production' ?
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
        ...(env_1.envs.NODE_ENV === 'production' ? [mongoTransport] : []), // Transport MongoDB uniquement en production, pour centraliser les logs d'erreurs
        // mongoTransport, // Suvegarer les logs dans mongoDb uniwuement en production
    ],
    exceptionHandlers: [
        new winston_1.transports.File({ filename: 'logs/exceptions.log' }), // Capture les exceptions non interceptées
        ...(env_1.envs.NODE_ENV === 'production' ? [mongoTransport] : []), // Transport MongoDB uniquement en production, pour centraliser les logs d'erreurs
        // mongoTransport, // Suvegarer les logs dans mongoDb uniwuement en production
    ],
    rejectionHandlers: [
        new winston_1.transports.File({ filename: 'logs/rejections.log' }), // Capture les promesses rejetées
        ...(env_1.envs.NODE_ENV === 'production' ? [mongoTransport] : []), // Transport MongoDB uniquement en production, pour centraliser les logs d'erreurs
        // mongoTransport, // Suvegarer les logs dans mongoDb uniwuement en production
    ]
});
exports.default = log;
//# sourceMappingURL=logger.js.map