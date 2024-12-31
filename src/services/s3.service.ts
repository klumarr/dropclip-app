import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

export const s3Operations = {
  // Get a pre-signed URL for uploading a file
  getUploadUrl: async (key: string, contentType: string): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  },

  // Get a pre-signed URL for downloading/viewing a file
  getDownloadUrl: async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  },

  // Generate a unique key for a file
  generateFileKey: (
    eventId: string,
    userId: string,
    fileName: string
  ): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `uploads/${eventId}/${userId}/${timestamp}-${sanitizedFileName}`;
  },

  // Generate a key for event flyer images
  generateFlyerKey: (eventId: string, fileName: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `events/${eventId}/flyer/${timestamp}-${sanitizedFileName}`;
  },
};
