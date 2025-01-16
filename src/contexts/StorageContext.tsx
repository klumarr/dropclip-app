import React, { createContext, useContext, useState, useCallback } from "react";
import {
  storageService,
  StorageQuota,
  StorageAnalytics,
} from "../services/storage.service";
import { s3Operations } from "../services/s3.service";
import { cloudfrontOperations } from "../services/cloudfront.service";
import { useAuth } from "./AuthContext";

interface StorageContextType {
  // Quota Management
  quota: StorageQuota | null;
  analytics: StorageAnalytics | null;
  refreshQuota: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  // File Operations
  uploadFile: (
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ) => Promise<{ url: string; key: string }>;
  getFileUrl: (key: string) => Promise<string>;
  getSignedUrl: (key: string, contentDisposition?: string) => Promise<string>;
  getDownloadUrl: (fileUrl: string) => Promise<string>;
  deleteFile: (key: string) => Promise<void>;

  // CDN Operations
  getCDNUrl: (key: string) => string;
  invalidateCache: (paths: string[]) => Promise<void>;

  // Storage Management
  getCleanupRecommendations: () => Promise<
    Array<{ key: string; reason: string; size: number }>
  >;
  archiveFiles: (
    fileKeys: string[]
  ) => Promise<{ archived: string[]; failed: string[] }>;
  formatBytes: (bytes: number) => string;
}

const StorageContext = createContext<StorageContextType | null>(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

interface StorageProviderProps {
  children: React.ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);

  const refreshQuota = useCallback(async () => {
    if (!user?.id) return;
    try {
      const newQuota = await storageService.getStorageQuota(user.id);
      setQuota(newQuota);
    } catch (error) {
      console.error("Failed to refresh storage quota:", error);
      throw error;
    }
  }, [user?.id]);

  const refreshAnalytics = useCallback(async () => {
    if (!user?.id) return;
    try {
      const newAnalytics = await storageService.getStorageAnalytics(user.id);
      setAnalytics(newAnalytics);
    } catch (error) {
      console.error("Failed to refresh storage analytics:", error);
      throw error;
    }
  }, [user?.id]);

  const getCleanupRecommendations = useCallback(async () => {
    if (!user?.id) throw new Error("User not authenticated");
    return storageService.getCleanupRecommendations(user.id);
  }, [user?.id]);

  const archiveFiles = useCallback(
    async (fileKeys: string[]) => {
      if (!user?.id) throw new Error("User not authenticated");
      return storageService.archiveFiles(user.id, fileKeys);
    },
    [user?.id]
  );

  // Initialize quota and analytics when user changes
  React.useEffect(() => {
    if (user?.id) {
      refreshQuota();
      refreshAnalytics();
    }
  }, [user?.id, refreshQuota, refreshAnalytics]);

  const value: StorageContextType = {
    // Quota Management
    quota,
    analytics,
    refreshQuota,
    refreshAnalytics,

    // File Operations
    uploadFile: s3Operations.uploadFile,
    getFileUrl: s3Operations.getFileUrl,
    getSignedUrl: s3Operations.getSignedUrl,
    getDownloadUrl: s3Operations.getDownloadUrl,
    deleteFile: s3Operations.deleteFile,

    // CDN Operations
    getCDNUrl: cloudfrontOperations.getFileUrl,
    invalidateCache: cloudfrontOperations.invalidateCache,

    // Storage Management
    getCleanupRecommendations,
    archiveFiles,
    formatBytes: storageService.formatBytes,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
