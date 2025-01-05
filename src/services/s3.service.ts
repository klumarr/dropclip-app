import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import env from "../config/env.config";

// Define the progress event type
interface ProgressEvent {
  loaded?: number;
  total?: number;
}

const s3Client = new S3Client({
  region: env.aws.region,
});

const BUCKET_NAME = env.aws.s3Bucket;

interface UploadResult {
  url: string;
  key: string;
}

export const s3Operations = {
  uploadFile: async (
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    // Simulate upload for now
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            url: URL.createObjectURL(file),
            key: `${folder}/${file.name}`,
          });
        }
      }, 200);
    });
  },

  async getFileUrl(key: string): Promise<string> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get file URL: ${error.message}`
          : "Failed to get file URL: Unknown error"
      );
    }
  },

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to delete file: ${error.message}`
          : "Failed to delete file: Unknown error"
      );
    }
  },

  generateFileKey(eventId: string, userId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `uploads/${eventId}/${userId}/${timestamp}_${sanitizedFileName}`;
  },

  generateFlyerKey(eventId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `events/${eventId}/flyers/${timestamp}_${sanitizedFileName}`;
  },
};
