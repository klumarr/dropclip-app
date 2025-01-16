import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { getAWSClient } from "./aws-client.factory";
import { region as AWS_REGION } from "../config/amplify-config";
import { getCredentials } from "./auth.service";
import { cloudfrontOperations } from "./cloudfront.service";

// Define the progress event type
interface ProgressEvent {
  loaded?: number;
  total?: number;
}

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_UPLOADS_BUCKET;
const CONTENT_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

interface UploadResult {
  url: string;
  key: string;
}

// Define the interface for s3Operations
interface S3Operations {
  uploadFile: (
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ) => Promise<UploadResult>;
  getFileUrl: (key: string) => Promise<string>;
  getSignedUrl: (key: string, contentDisposition?: string) => Promise<string>;
  getDownloadUrl: (fileUrl: string) => Promise<string>;
  deleteFile: (key: string) => Promise<void>;
  generateFileKey: (
    eventId: string,
    userId: string,
    fileName: string
  ) => string;
  generateFlyerKey: (eventId: string, fileName: string) => Promise<string>;
  getUploadUrl: (key: string, contentType: string) => Promise<string>;
  copyFile: (sourceKey: string, destinationKey: string) => Promise<void>;
}

// Get S3 client using our factory
const getS3Client = async (): Promise<S3Client> => {
  return getAWSClient(S3Client);
};

export const s3Operations: S3Operations = {
  uploadFile: async (
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    try {
      console.log("📤 Starting file upload:", {
        name: file.name,
        size: file.size,
        type: file.type,
        folder,
      });

      const s3Client = await getS3Client();
      const key = `${folder}/${Date.now()}_${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file,
          ContentType: file.type,
        },
      });

      // Handle upload progress
      upload.on("httpUploadProgress", (progress: ProgressEvent) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          console.log(`📊 Upload progress: ${percentage}%`);
          onProgress?.(percentage);
        }
      });

      await upload.done();
      console.log("✅ Upload complete:", key);

      // Get the URL for the uploaded file
      const url = await s3Operations.getFileUrl(key);

      return {
        url,
        key,
      };
    } catch (error) {
      console.error("❌ Upload failed:", error);
      throw new Error(
        error instanceof Error
          ? `Upload failed: ${error.message}`
          : "Upload failed: Unknown error"
      );
    }
  },

  async getFileUrl(key: string): Promise<string> {
    try {
      console.log("🔍 Getting file URL:", key);
      const url = cloudfrontOperations.getFileUrl(key);
      console.log("✅ Got file URL (via CloudFront)");
      return url;
    } catch (error) {
      console.error("❌ Error getting file URL:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get file URL: ${error.message}`
          : "Failed to get file URL: Unknown error"
      );
    }
  },

  async getSignedUrl(
    key: string,
    contentDisposition?: string
  ): Promise<string> {
    try {
      console.log("🔐 Getting signed URL:", key);
      // Use CloudFront URL instead of signed S3 URL
      const url = cloudfrontOperations.getFileUrl(key);
      console.log("✅ Got CloudFront URL");
      return url;
    } catch (error) {
      console.error("❌ Error getting signed URL:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get signed URL: ${error.message}`
          : "Failed to get signed URL: Unknown error"
      );
    }
  },

  async getDownloadUrl(fileUrl: string): Promise<string> {
    try {
      console.log("🔽 Getting download URL for:", fileUrl);
      // Extract the key from the fileUrl (remove the CloudFront domain)
      const key = fileUrl.split("/").slice(3).join("/");
      // Use CloudFront URL
      const url = cloudfrontOperations.getFileUrl(key);
      console.log("✅ Got CloudFront download URL");
      return url;
    } catch (error) {
      console.error("❌ Error getting download URL:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get download URL: ${error.message}`
          : "Failed to get download URL: Unknown error"
      );
    }
  },

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      console.log("🗑️ Deleting file:", key);
      const s3Client = await getS3Client();
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      console.log("✅ File deleted");
    } catch (error) {
      console.error("❌ Error deleting file:", error);
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

  generateFlyerKey: async (
    eventId: string,
    fileName: string
  ): Promise<string> => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const credentials = await getCredentials();
    const identityId = credentials.identityId.split("/").pop(); // Get the last part of the ARN
    return `events/${identityId}/${eventId}/flyers/${timestamp}_${sanitizedFileName}`;
  },

  async getUploadUrl(key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    };

    try {
      console.log("🔼 Getting upload URL:", key);
      const s3Client = await getS3Client();
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      console.log("✅ Got upload URL");
      return url;
    } catch (error) {
      console.error("❌ Error getting upload URL:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get upload URL: ${error.message}`
          : "Failed to get upload URL: Unknown error"
      );
    }
  },

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      console.log("📋 Copying file:", {
        from: `${BUCKET_NAME}/${sourceKey}`,
        to: `${CONTENT_BUCKET}/${destinationKey}`,
      });

      const s3Client = await getS3Client();
      const command = new CopyObjectCommand({
        Bucket: CONTENT_BUCKET,
        CopySource: encodeURIComponent(`${BUCKET_NAME}/${sourceKey}`),
        Key: destinationKey,
        ACL: "private",
        MetadataDirective: "COPY",
      });

      await s3Client.send(command);
      console.log("✅ File copied successfully");
    } catch (error) {
      console.error("❌ Error copying file:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to copy file: ${error.message}`
          : "Failed to copy file: Unknown error"
      );
    }
  },
};
