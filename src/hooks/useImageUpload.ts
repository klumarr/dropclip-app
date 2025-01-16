import { useState, useCallback } from "react";
import { s3Operations } from "../services/s3.service";
import { cloudfrontOperations } from "../services/cloudfront.service";

interface UseImageUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  handleImageUpload: (file: File) => Promise<string>;
  handleImageRemove: () => void;
  error: string | null;
}

export const useImageUpload = (
  folder: string = "events"
): UseImageUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      console.log("🚀 Starting image upload process:", {
        file,
        folder,
        size: file.size,
        type: file.type,
        name: file.name,
      });

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        console.log("📤 Uploading to S3...");
        const uploadResult = await s3Operations.uploadFile(
          file,
          folder,
          (progress) => {
            console.log(`📊 Upload progress: ${progress}%`);
            setUploadProgress(Math.round(progress));
          }
        );
        console.log("✅ S3 upload successful:", uploadResult);

        // Copy file to content bucket
        console.log("📋 Copying to content bucket...");
        await s3Operations.copyFile(uploadResult.key, uploadResult.key);
        console.log("✅ File copied to content bucket");

        console.log("🔄 Getting CloudFront URL...");
        const cloudFrontUrl = cloudfrontOperations.getFileUrl(uploadResult.key);
        console.log("✅ CloudFront URL generated:", {
          url: cloudFrontUrl,
          key: uploadResult.key,
        });

        setIsUploading(false);
        setUploadProgress(100);
        return cloudFrontUrl;
      } catch (error) {
        console.error("❌ Error in image upload process:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Detailed error:", {
          message: errorMessage,
          folder,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        });
        setError("Failed to upload image. Please try again.");
        setIsUploading(false);
        setUploadProgress(0);
        throw error;
      }
    },
    [folder]
  );

  const handleImageRemove = useCallback(() => {
    console.log("🗑️ Removing image...");
    setUploadProgress(0);
    setError(null);
    setIsUploading(false);
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    handleImageUpload,
    handleImageRemove,
  };
};
