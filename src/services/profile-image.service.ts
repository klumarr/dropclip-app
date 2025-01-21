import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getAWSClient } from "./aws-client.factory";
import { getCredentials } from "./auth.service";
import { userService } from "./user.service";

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_IMAGES_BUCKET;
const REGION = import.meta.env.VITE_AWS_REGION;

interface UploadProgress {
  loaded: number;
  total: number;
}

class ProfileImageService {
  private async getS3Client(): Promise<S3Client> {
    return getAWSClient(S3Client);
  }

  async uploadProfileImage(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    console.log("📤 ProfileImageService - Starting profile image upload:", {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const s3Client = await this.getS3Client();

      // Generate a unique key for the profile image
      const key = `profile-images/${userId}/${Date.now()}_${file.name.replace(
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
          ACL: "private", // Ensure the file is private
        },
      });

      // Handle upload progress
      upload.on("httpUploadProgress", (progress: UploadProgress) => {
        console.log(
          `📊 Upload progress: ${Math.round(
            (progress.loaded / progress.total) * 100
          )}%`
        );
        onProgress?.(progress);
      });

      await upload.done();
      console.log("✅ Profile image upload complete:", key);

      // Generate the CloudFront URL for the image
      const cloudFrontDomain = import.meta.env.VITE_AWS_CLOUDFRONT_DOMAIN;
      const imageUrl = cloudFrontDomain.startsWith("http")
        ? `${cloudFrontDomain}/${key}`
        : `https://${cloudFrontDomain}/${key}`;

      // Update the user's profile with the new image URL
      await userService.updateUserProfile({
        id: userId,
        avatarUrl: imageUrl,
      });

      return imageUrl;
    } catch (error) {
      console.error("❌ Profile image upload failed:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to upload profile image: ${error.message}`
          : "Failed to upload profile image"
      );
    }
  }

  async deleteProfileImage(userId: string, imageUrl: string): Promise<void> {
    try {
      const s3Client = await this.getS3Client();
      const key = imageUrl.split("/").slice(3).join("/"); // Extract key from CloudFront URL

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);

      // Update user profile to remove the image URL
      await userService.updateUserProfile({
        id: userId,
        avatarUrl: "",
      });

      console.log("✅ Profile image deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete profile image:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to delete profile image: ${error.message}`
          : "Failed to delete profile image"
      );
    }
  }
}

export const profileImageService = new ProfileImageService();
