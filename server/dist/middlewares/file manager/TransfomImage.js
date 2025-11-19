"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSVG = void 0;
const jimp_1 = __importDefault(require("jimp"));
const potrace_1 = __importDefault(require("potrace"));
const fs_1 = __importDefault(require("fs"));
const convertToSVG = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        // Charger l'image avec Jimp
        jimp_1.default.read(inputPath, (err, image) => {
            if (err) {
                reject(err);
                return;
            }
            // Convertir l'image en noir et blanc
            image.greyscale().contrast(1);
            // Obtenir un Buffer de l'image
            image.getBufferAsync(jimp_1.default.MIME_PNG).then((buffer) => {
                // Convertir en SVG avec potrace
                potrace_1.default.trace(buffer, (err, svg) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Écrire le SVG dans le fichier de sortie
                    fs_1.default.writeFile(outputPath, svg, (err) => {
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
exports.convertToSVG = convertToSVG;
//# sourceMappingURL=TransfomImage.js.map