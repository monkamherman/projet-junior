import Jimp from "jimp";
import potrace from "potrace";
import fs from "fs";

export const convertToSVG = async (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Charger l'image avec Jimp
        Jimp.read(inputPath, (err, image) => {
            if (err) {
                reject(err);
                return;
            }

            // Convertir l'image en noir et blanc
            image.greyscale().contrast(1);

            // Obtenir un Buffer de l'image
            image.getBufferAsync(Jimp.MIME_PNG).then((buffer) => {
                // Convertir en SVG avec potrace
                potrace.trace(buffer, (err, svg) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Écrire le SVG dans le fichier de sortie
                    fs.writeFile(outputPath, svg, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                });
            }).catch((err) => {
                reject(err);
            });
        });
    });
};