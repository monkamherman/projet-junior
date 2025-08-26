import ffmpeg from "fluent-ffmpeg";

export const compressVideo = async (inputPath: string, outputPath: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions("-vcodec libx264") // Encoder avec H.264
            .outputOptions("-crf 28") // Qualité de compression
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", (err) => {
                reject(err.message);
            });
    });
};
