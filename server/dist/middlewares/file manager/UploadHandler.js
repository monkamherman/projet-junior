"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHandler = void 0;
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploader_1 = require("../../services/uploader");
const TransfomImage_1 = require("./TransfomImage");
const CompressVideo_1 = require("./CompressVideo");
const logger_1 = __importDefault(require("../../utils/logger"));
const supportedImageTypes = ['jpg', 'jpeg', 'png'];
const supportedVideoTypes = ['mp4', 'mov'];
const supportedDocumentTypes = ['pdf', 'docx'];
const uploadHandler = async (req) => {
    return new Promise((resolve, reject) => {
        const form = (0, formidable_1.default)({
            uploadDir: "/tmp", // Dossier temporaire pour stocker les fichiers
            keepExtensions: true, // Conserver les extensions des fichiers
        });
        const fields = {};
        let file = null;
        // Récupérer les champs du formulaire
        form.on("field", (fieldName, value) => {
            fields[fieldName] = value;
        });
        // Récupérer le fichier uploadé
        form.on("file", (fieldName, uploadedFile) => {
            file = uploadedFile;
        });
        // Une fois le parsing terminé
        form.on("end", async () => {
            if (!file) {
                reject(new Error("Aucun fichier uploadé."));
                return;
            }
            const { filepath, originalFilename, mimetype } = file;
            logger_1.default.info(`Fichier reçu: ${originalFilename}, Type MIME: ${mimetype}`);
            try {
                const extension = originalFilename?.split('.').pop()?.toLowerCase();
                const transformedFilePath = path_1.default.join("/tmp", `transformed-${originalFilename}`);
                logger_1.default.info(`Traitement du fichier: ${originalFilename}, Extension: ${extension}`);
                if (supportedImageTypes.includes(extension || '')) {
                    logger_1.default.info('Conversion en SVG en cours...');
                    await (0, TransfomImage_1.convertToSVG)(filepath, transformedFilePath);
                }
                else if (supportedVideoTypes.includes(extension || '')) {
                    logger_1.default.info('Compression vidéo en cours...');
                    await (0, CompressVideo_1.compressVideo)(filepath, transformedFilePath);
                }
                else if (supportedDocumentTypes.includes(extension || '')) {
                    logger_1.default.info('Fichier document détecté, pas de transformation nécessaire.');
                    fs_1.default.renameSync(filepath, transformedFilePath);
                }
                else {
                    const errorMessage = `Type de fichier non pris en charge : ${mimetype}`;
                    logger_1.default.error(errorMessage);
                    throw new Error(errorMessage);
                }
                logger_1.default.info('Upload vers S3/MinIO en cours...');
                const fileUrl = await (0, uploader_1.uploadToMinIO)(transformedFilePath, originalFilename || "file", mimetype || "application/octet-stream");
                // Supprimer les fichiers temporaires
                fs_1.default.unlinkSync(filepath);
                fs_1.default.unlinkSync(transformedFilePath);
                logger_1.default.info('Fichiers temporaires supprimés.');
                resolve({ fileUrl, fields });
            }
            catch (error) {
                logger_1.default.error('Erreur lors du traitement du fichier:', error);
                reject(error);
            }
        });
        // Gérer les erreurs
        form.on("error", (err) => {
            logger_1.default.error('Erreur lors du parsing du formulaire:', err);
            reject(err);
        });
        // Parser la requête
        form.parse(req);
    });
};
exports.uploadHandler = uploadHandler;
//# sourceMappingURL=UploadHandler.js.map