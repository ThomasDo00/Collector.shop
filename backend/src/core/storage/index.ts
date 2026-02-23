import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { env } from '@core/config/env.js';
import { logger } from '@core/logger/index.js';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }
  return s3Client;
};

export const initStorage = async (): Promise<void> => {
  const client = getS3Client();

  try {
    await client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    logger.info(`Storage bucket "${env.S3_BUCKET}" already exists`);
  } catch {
    logger.info(`Creating storage bucket "${env.S3_BUCKET}"...`);
    await client.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));

    // Make bucket publicly readable
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${env.S3_BUCKET}/*`],
        },
      ],
    });

    await client.send(
      new PutBucketPolicyCommand({ Bucket: env.S3_BUCKET, Policy: policy })
    );

    logger.info(`Storage bucket "${env.S3_BUCKET}" created and configured`);
  }
};

export const uploadFile = async (
  buffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<string> => {
  const client = getS3Client();
  const ext = path.extname(originalFilename).toLowerCase();
  const key = `products/${randomUUID()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return getPublicUrl(key);
};

export const deleteFile = async (imageUrl: string): Promise<void> => {
  const client = getS3Client();
  // Extract key: works for /storage/bucket/key and http://endpoint/bucket/key
  const bucketPrefix = `/${env.S3_BUCKET}/`;
  const idx = imageUrl.indexOf(bucketPrefix);
  if (idx === -1) return;
  const key = imageUrl.slice(idx + bucketPrefix.length);

  await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
};

// Returns a browser-accessible path proxied through nginx (/storage/ → minio:9000)
export const getPublicUrl = (key: string): string => {
  return `/storage/${env.S3_BUCKET}/${key}`;
};
