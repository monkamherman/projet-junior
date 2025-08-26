import { S3Client } from "@aws-sdk/client-s3";
import { envs } from "../core/config/env";

if (!envs.MINIO_ROOT_USER || !envs.MINIO_ROOT_PASSWORD || !envs.MINIO_HOST || !envs.MINIO_PORT) {
    throw new Error("Les variables d'environnement pour MinIO ne sont pas correctement configurées.");
}

const client = new S3Client({
    region: envs.REGION_AWS,
    credentials: {
        accessKeyId: envs.MINIO_ROOT_USER,
        secretAccessKey: envs.MINIO_ROOT_PASSWORD,
    },
    endpoint: `http://${envs.MINIO_HOST}:${envs.MINIO_PORT}`,
    forcePathStyle: true,
});

export default client;
