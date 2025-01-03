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

export const s3Operations = {
  async uploadFile(
    file: File,
    key: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    };

    try {
      // Use multipart upload with progress tracking
      const upload = new Upload({
        client: s3Client,
        params,
      });

      // Add progress listener if callback provided
      if (onProgress) {
        upload.on("httpUploadProgress", (progress: ProgressEvent) => {
          const percentage = Math.round(
            ((progress.loaded || 0) * 100) / (progress.total || file.size)
          );
          onProgress(percentage);
        });
      }

      await upload.done();
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to upload file: ${error.message}`
          : "Failed to upload file: Unknown error"
      );
    }
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
