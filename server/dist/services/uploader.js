"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToMinIO = void 0;
const lib_storage_1 = require("@aws-sdk/lib-storage");
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../utils/logger"));
const s3client_1 = __importDefault(require("../services/s3client"));
const env_1 = require("../core/config/env");
// Fonction pour uploader un fichier dans MinIO
const uploadToMinIO = async (filePath, filename, mimetype) => {
    const fileStream = fs_1.default.createReadStream(filePath);
    if (!env_1.envs.BUCKET_NAME) {
        throw new Error("Les variables d'environnement pour MinIO ne sont pas correctement configurées.");
    }
    try {
        const upload = new lib_storage_1.Upload({
            client: s3client_1.default,
            params: {
                Bucket: env_1.envs.BUCKET_NAME, // Nom du bucket
                Key: filename, // Nom du fichier dans MinIO
                Body: fileStream, // Contenu du fichier
                ContentType: mimetype, // Type MIME du fichier
            },
        });
        const result = await upload.done();
        logger_1.default.info("Fichier uploadé avec succès:", result.Location);
        if (!result.Location) {
            throw new Error("L'URL du fichier n'a pas été retournée par MinIO.");
        }
        return result.Location;
    }
    catch (error) {
        logger_1.default.info("Erreur lors de l'upload vers MinIO:", error);
        throw error;
    }
    finally {
        // Supprimer le fichier temporaire
        fs_1.default.unlinkSync(filePath);
    }
};
exports.uploadToMinIO = uploadToMinIO;
//# sourceMappingURL=uploader.js.map