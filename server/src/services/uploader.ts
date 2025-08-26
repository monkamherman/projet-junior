
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import log from "../utils/logger";
import client from "../services/s3client";
import { envs } from "../core/config/env";

// Fonction pour uploader un fichier dans MinIO
export const uploadToMinIO = async (
    filePath: string,
    filename: string,
    mimetype: string
): Promise<string> => {
    const fileStream = fs.createReadStream(filePath);

    if(!envs.BUCKET_NAME){
    throw new Error("Les variables d'environnement pour MinIO ne sont pas correctement configurées.");
    }
    try {
        const upload = new Upload({
            client: client,
            params: {
                Bucket: envs.BUCKET_NAME, // Nom du bucket
                Key: filename, // Nom du fichier dans MinIO
                Body: fileStream, // Contenu du fichier
                ContentType: mimetype, // Type MIME du fichier
            },
        });

        const result = await upload.done();

    log.info("Fichier uploadé avec succès:", result.Location);

    if (!result.Location) {
        throw new Error("L'URL du fichier n'a pas été retournée par MinIO.");
    }
    return result.Location;
    } catch (error) {
        log.info("Erreur lors de l'upload vers MinIO:", error);
        throw error;
    } finally {
        // Supprimer le fichier temporaire
        fs.unlinkSync(filePath);
    }
};