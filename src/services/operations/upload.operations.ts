import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb";
import { UploadItem } from "../../config/dynamodb";
import { createAWSClient } from "../aws-client.factory";
import { s3Operations } from "../s3.service";
import { cloudfrontOperations } from "../cloudfront.service";
import { lambdaOperations } from "../lambda.service";

export class UploadError extends Error {
  constructor(
    message: string,
    public code:
      | "UPLOAD_LIMIT_REACHED"
      | "INVALID_FILE"
      | "UPLOAD_FAILED" = "UPLOAD_FAILED"
  ) {
    super(message);
    this.name = "UploadError";
  }
}

class UploadService {
  private docClient: DynamoDBDocumentClient | null = null;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    console.log("UploadService - Initializing with table:", TableNames.UPLOADS);
  }

  private async ensureClient(): Promise<DynamoDBDocumentClient> {
    if (this.docClient) return this.docClient;

    const client = await createAWSClient(DynamoDBClient);
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });

    return this.docClient;
  }

  private async executeWithRetry<T>(
    operation: (client: DynamoDBDocumentClient) => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.retryDelay;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const client = await this.ensureClient();
        return await operation(client);
      } catch (error) {
        console.error(
          `UploadService - Operation failed (attempt ${attempt}/${this.retryCount}):`,
          error
        );
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryCount) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError || new Error("Operation failed after retries");
  }

  async createUpload(
    upload: Omit<UploadItem, "uploadDate" | "fileUrl" | "thumbnailUrl">,
    file: File,
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<UploadItem> {
    console.log("UploadService - Creating upload:", upload);

    const newUpload: UploadItem = {
      ...upload,
      uploadDate: new Date().toISOString(),
      fileUrl: "",
      thumbnailUrl: "",
    };

    // Upload file to S3
    try {
      const { url } = await s3Operations.uploadFile(
        file,
        upload.fileKey,
        onProgress
          ? (progress: number) =>
              onProgress({ loaded: progress * file.size, total: file.size })
          : undefined
      );

      // Update the upload with the file URL
      newUpload.fileUrl = url;

      // Create the upload record in DynamoDB
      await this.executeWithRetry(async (client) => {
        const command = new PutCommand({
          TableName: TableNames.UPLOADS,
          Item: newUpload,
        });

        await client.send(command);
      });

      console.log("UploadService - Upload created successfully:", newUpload);
      return newUpload;
    } catch (error) {
      console.error("UploadService - Failed to create upload:", error);
      throw new UploadError(
        error instanceof Error ? error.message : "Failed to create upload",
        "UPLOAD_FAILED"
      );
    }
  }

  async getUpload(id: string, eventId: string): Promise<UploadItem | null> {
    console.log("UploadService - Getting upload:", { id, eventId });

    const result = await this.executeWithRetry(async (client) => {
      const command = new GetCommand({
        TableName: TableNames.UPLOADS,
        Key: {
          id,
          eventId,
        },
      });

      return client.send(command);
    });

    return (result.Item as UploadItem) || null;
  }

  async listEventUploads(eventId: string): Promise<UploadItem[]> {
    console.log("UploadService - Listing uploads for event:", eventId);

    const result = await this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.UPLOADS,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId,
        },
      });

      return client.send(command);
    });

    return (result.Items || []) as UploadItem[];
  }

  async listUserUploads(userId: string): Promise<UploadItem[]> {
    console.log("UploadService - Listing uploads for user:", userId);

    const result = await this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.UPLOADS,
        IndexName: "userUploads",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });

      return client.send(command);
    });

    return (result.Items || []) as UploadItem[];
  }

  async updateUploadStatus(
    id: string,
    eventId: string,
    status: UploadItem["status"]
  ): Promise<void> {
    console.log("UploadService - Updating upload status:", {
      id,
      eventId,
      status,
    });

    await this.executeWithRetry(async (client) => {
      const command = new UpdateCommand({
        TableName: TableNames.UPLOADS,
        Key: {
          id,
          eventId,
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
      });

      await client.send(command);
    });

    console.log("UploadService - Upload status updated successfully");
  }
}

const service = new UploadService();

export const uploadOperations = {
  createUpload: async (
    upload: Omit<UploadItem, "uploadDate" | "fileUrl" | "thumbnailUrl">,
    file: File,
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<UploadItem> => {
    return service.createUpload(upload, file, onProgress);
  },

  validateFile: (file: File): void => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-m4v"];

    if (file.size > maxSize) {
      throw new UploadError(
        `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        "INVALID_FILE"
      );
    }

    if (!allowedTypes.includes(file.type)) {
      throw new UploadError(
        `File type must be one of: ${allowedTypes.join(", ")}`,
        "INVALID_FILE"
      );
    }
  },

  getUpload: async (
    id: string,
    eventId: string
  ): Promise<UploadItem | null> => {
    return service.getUpload(id, eventId);
  },

  listEventUploads: async (eventId: string): Promise<UploadItem[]> => {
    return service.listEventUploads(eventId);
  },

  listUserUploads: async (userId: string): Promise<UploadItem[]> => {
    return service.listUserUploads(userId);
  },

  updateUploadStatus: async (
    id: string,
    eventId: string,
    status: UploadItem["status"]
  ): Promise<void> => {
    return service.updateUploadStatus(id, eventId, status);
  },
};
