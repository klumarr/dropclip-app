import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getAWSClient } from "./aws-client.factory";

export interface StorageQuota {
  total: number;
  used: number;
  available: number;
}

export interface StorageAnalytics {
  totalFiles: number;
  totalSize: number;
  averageFileSize: number;
  largestFiles: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  unusedFiles: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
}

class StorageService {
  private readonly BUCKET_NAME = import.meta.env.VITE_AWS_S3_UPLOADS_BUCKET;
  private readonly MAX_STORAGE = 50 * 1024 * 1024 * 1024; // 50GB default quota

  async getStorageQuota(userId: string): Promise<StorageQuota> {
    try {
      const s3Client = await getAWSClient(S3Client);
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        Prefix: `creative-videos/${userId}/`,
      });

      const response = await s3Client.send(command);
      const usedStorage =
        response.Contents?.reduce(
          (total, item) => total + (item.Size || 0),
          0
        ) || 0;

      return {
        total: this.MAX_STORAGE,
        used: usedStorage,
        available: this.MAX_STORAGE - usedStorage,
      };
    } catch (error) {
      console.error("Error getting storage quota:", error);
      throw error;
    }
  }

  async getStorageAnalytics(userId: string): Promise<StorageAnalytics> {
    try {
      const s3Client = await getAWSClient(S3Client);
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        Prefix: `creative-videos/${userId}/`,
      });

      const response = await s3Client.send(command);
      const files = response.Contents || [];

      // Calculate analytics
      const totalSize = files.reduce(
        (total, item) => total + (item.Size || 0),
        0
      );
      const totalFiles = files.length;
      const averageFileSize = totalFiles > 0 ? totalSize / totalFiles : 0;

      // Get largest files (top 5)
      const largestFiles = [...files]
        .sort((a, b) => (b.Size || 0) - (a.Size || 0))
        .slice(0, 5)
        .map((file) => ({
          key: file.Key || "",
          size: file.Size || 0,
          lastModified: file.LastModified || new Date(),
        }));

      // Get unused files (not accessed in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const unusedFiles = files
        .filter(
          (file) => file.LastModified && file.LastModified < thirtyDaysAgo
        )
        .map((file) => ({
          key: file.Key || "",
          size: file.Size || 0,
          lastModified: file.LastModified || new Date(),
        }));

      return {
        totalFiles,
        totalSize,
        averageFileSize,
        largestFiles,
        unusedFiles,
      };
    } catch (error) {
      console.error("Error getting storage analytics:", error);
      throw error;
    }
  }

  async getCleanupRecommendations(
    userId: string
  ): Promise<Array<{ key: string; reason: string; size: number }>> {
    const analytics = await this.getStorageAnalytics(userId);
    const recommendations: Array<{
      key: string;
      reason: string;
      size: number;
    }> = [];

    // Add unused files
    analytics.unusedFiles.forEach((file) => {
      recommendations.push({
        key: file.key,
        reason: "Not accessed in the last 30 days",
        size: file.size,
      });
    });

    // Add large files that might be compressed
    analytics.largestFiles.forEach((file) => {
      if (file.size > 500 * 1024 * 1024) {
        // Files larger than 500MB
        recommendations.push({
          key: file.key,
          reason: "Large file that could be compressed",
          size: file.size,
        });
      }
    });

    return recommendations;
  }

  async archiveFiles(
    userId: string,
    fileKeys: string[]
  ): Promise<{ archived: string[]; failed: string[] }> {
    // This would typically move files to a cheaper storage tier
    // For now, we'll just return a mock response
    return {
      archived: fileKeys,
      failed: [],
    };
  }

  formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export const storageService = new StorageService();
