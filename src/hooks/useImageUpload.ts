import { useState, useCallback } from "react";
import { s3Operations } from "../services/s3.service";

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
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const uploadResult = await s3Operations.uploadFile(
          file,
          folder,
          (progress) => {
            setUploadProgress(Math.round(progress));
          }
        );

        console.log(
          `Image uploaded successfully to ${folder}:`,
          uploadResult.url
        );
        return uploadResult.url;
      } catch (error) {
        console.error(`Error uploading image to ${folder}:`, error);
        setError("Failed to upload image. Please try again.");
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [folder]
  );

  const handleImageRemove = useCallback(() => {
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    handleImageUpload,
    handleImageRemove,
    error,
  };
};
