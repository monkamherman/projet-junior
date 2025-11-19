"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../core/config/env");
if (!env_1.envs.MINIO_ROOT_USER || !env_1.envs.MINIO_ROOT_PASSWORD || !env_1.envs.MINIO_HOST || !env_1.envs.MINIO_PORT) {
    throw new Error("Les variables d'environnement pour MinIO ne sont pas correctement configurées.");
}
const client = new client_s3_1.S3Client({
    region: env_1.envs.REGION_AWS,
    credentials: {
        accessKeyId: env_1.envs.MINIO_ROOT_USER,
        secretAccessKey: env_1.envs.MINIO_ROOT_PASSWORD,
    },
    endpoint: `http://${env_1.envs.MINIO_HOST}:${env_1.envs.MINIO_PORT}`,
    forcePathStyle: true,
});
exports.default = client;
//# sourceMappingURL=s3client.js.map