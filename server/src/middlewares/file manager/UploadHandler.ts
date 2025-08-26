import { Request } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { uploadToMinIO } from "../../services/uploader"; 
import { convertToSVG } from "./TransfomImage";
import { compressVideo } from "./CompressVideo";
import log from "../../utils/logger";

const supportedImageTypes = ['jpg', 'jpeg', 'png'];
const supportedVideoTypes = ['mp4', 'mov'];
const supportedDocumentTypes = ['pdf', 'docx'];

export const uploadHandler = async (req: Request): Promise<{ fileUrl: string; fields: Record<string, string> }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({
            uploadDir: "/tmp", // Dossier temporaire pour stocker les fichiers
            keepExtensions: true, // Conserver les extensions des fichiers
        });

        const fields: Record<string, string> = {};
        let file: formidable.File | null = null;

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

            log.info(`Fichier reçu: ${originalFilename}, Type MIME: ${mimetype}`);

            try {
                const extension = originalFilename?.split('.').pop()?.toLowerCase();
                const transformedFilePath = path.join("/tmp", `transformed-${originalFilename}`);

                log.info(`Traitement du fichier: ${originalFilename}, Extension: ${extension}`);

                if (supportedImageTypes.includes(extension || '')) {
                    log.info('Conversion en SVG en cours...');
                    await convertToSVG(filepath, transformedFilePath);
                } else if (supportedVideoTypes.includes(extension || '')) {
                    log.info('Compression vidéo en cours...');
                    await compressVideo(filepath, transformedFilePath);
                } else if (supportedDocumentTypes.includes(extension || '')) {
                    log.info('Fichier document détecté, pas de transformation nécessaire.');
                    fs.renameSync(filepath, transformedFilePath);
                } else {
                    const errorMessage = `Type de fichier non pris en charge : ${mimetype}`;
                    log.error(errorMessage);
                    throw new Error(errorMessage);
                }

                log.info('Upload vers S3/MinIO en cours...');
                const fileUrl = await uploadToMinIO(transformedFilePath, originalFilename || "file", mimetype || "application/octet-stream");

                // Supprimer les fichiers temporaires
                fs.unlinkSync(filepath);
                fs.unlinkSync(transformedFilePath);
                log.info('Fichiers temporaires supprimés.');

                resolve({ fileUrl, fields });
            } catch (error) {
                log.error('Erreur lors du traitement du fichier:', error);
                reject(error);
            }
        });

        // Gérer les erreurs
        form.on("error", (err) => {
            log.error('Erreur lors du parsing du formulaire:', err);
            reject(err);
        });

        // Parser la requête
        form.parse(req);
    });
};