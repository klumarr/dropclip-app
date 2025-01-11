import { API_BASE_URL } from "../config";
import { CreateUploadParams, Upload, UploadProgress } from "../types/uploads";

export class UploadError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "UploadError";
  }
}

class UploadService {
  private baseUrl = `${API_BASE_URL}/uploads`;

  validateFile(file: File): void {
    // Check file size (100MB default limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      throw new UploadError(
        `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`,
        "FILE_SIZE_EXCEEDED"
      );
    }

    // Check file type
    const allowedTypes = ["video/mp4", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      throw new UploadError(
        `File type ${
          file.type
        } is not supported. Supported types: ${allowedTypes.join(", ")}`,
        "INVALID_FILE_TYPE"
      );
    }
  }

  async createUpload(
    params: CreateUploadParams,
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<Upload> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to create upload");
    }

    const upload = await response.json();

    if (params.file) {
      const uploadUrl = await this.getUploadUrl(upload.id);
      await this.uploadFile(uploadUrl, params.file, (progress) => {
        onProgress?.({ loaded: progress, total: 100 });
      });
    }

    return upload;
  }

  async getUploadUrl(uploadId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${uploadId}/url`);
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    const { url } = await response.json();
    return url;
  }

  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };
    }

    return new Promise((resolve, reject) => {
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(file);
    });
  }

  async getUploadProgress(uploadId: string): Promise<UploadProgress> {
    const response = await fetch(`${this.baseUrl}/${uploadId}/progress`);
    if (!response.ok) {
      throw new Error("Failed to get upload progress");
    }
    return response.json();
  }

  async cancelUpload(uploadId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${uploadId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel upload");
    }
  }

  async getUpload(uploadId: string): Promise<Upload> {
    const response = await fetch(`${this.baseUrl}/${uploadId}`);
    if (!response.ok) {
      throw new Error("Failed to get upload");
    }
    return response.json();
  }

  async listUploads(eventId: string): Promise<Upload[]> {
    const response = await fetch(`${this.baseUrl}?eventId=${eventId}`);
    if (!response.ok) {
      throw new Error("Failed to list uploads");
    }
    return response.json();
  }
}

export const uploadService = new UploadService();
