import env from "../config/env.config";

interface UploadResult {
  url: string;
  key: string;
}

// Helper function to determine which bucket to use
const getBucketForFolder = (folder: string): string => {
  if (folder.startsWith("events/flyers")) {
    return env.aws.s3ImagesBucket;
  } else if (folder.startsWith("uploads/")) {
    return env.aws.s3UploadsBucket;
  }
  return env.aws.s3Bucket;
};

export const s3Operations = {
  async uploadFile(file: File, folder: string): Promise<UploadResult> {
    try {
      const key = `${folder}/${Date.now()}_${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const bucketName = getBucketForFolder(folder);

      console.log("Starting file upload:", {
        key,
        contentType: file.type,
        fileSize: file.size,
        bucket: bucketName,
        folder,
      });

      // Get pre-signed URL from backend
      const response = await fetch(`${env.api.endpoint}/s3/presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          contentType: file.type,
          bucket: bucketName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get pre-signed URL");
      }

      const { presignedUrl, publicUrl } = await response.json();

      console.log("Received pre-signed URL:", {
        presignedUrl,
        publicUrl,
      });

      // Upload using pre-signed URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      console.log("File uploaded successfully:", {
        key,
        publicUrl,
      });

      return {
        url: publicUrl,
        key,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  async getFileUrl(key: string): Promise<string> {
    try {
      const response = await fetch(
        `${env.api.endpoint}/s3/file-url/${encodeURIComponent(key)}`
      );
      if (!response.ok) {
        throw new Error("Failed to get file URL");
      }
      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw error;
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
