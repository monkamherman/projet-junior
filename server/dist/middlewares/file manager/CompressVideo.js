"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressVideo = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const compressVideo = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
            .outputOptions("-vcodec libx264") // Encoder avec H.264
            .outputOptions("-crf 28") // Qualité de compression
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", (err) => {
            reject(err.message);
        });
    });
};
exports.compressVideo = compressVideo;
//# sourceMappingURL=CompressVideo.js.map