import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TableNames } from "../config/dynamodb";
import { Upload, UploadStatus } from "../types/uploads";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

export class ModerationService {
  static async approveUpload(uploadId: string): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TableNames.UPLOADS,
        Key: { id: uploadId },
        UpdateExpression: "SET #status = :status, modifiedAt = :modifiedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": UploadStatus.APPROVED,
          ":modifiedAt": new Date().toISOString(),
        },
      });

      await docClient.send(command);
      console.log(`Upload ${uploadId} approved successfully`);
    } catch (error) {
      console.error("Error approving upload:", error);
      throw new Error("Failed to approve upload");
    }
  }

  static async rejectUpload(uploadId: string): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TableNames.UPLOADS,
        Key: { id: uploadId },
        UpdateExpression: "SET #status = :status, modifiedAt = :modifiedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": UploadStatus.REJECTED,
          ":modifiedAt": new Date().toISOString(),
        },
      });

      await docClient.send(command);
      console.log(`Upload ${uploadId} rejected successfully`);
    } catch (error) {
      console.error("Error rejecting upload:", error);
      throw new Error("Failed to reject upload");
    }
  }

  static async getUploadsByStatus(status: UploadStatus): Promise<Upload[]> {
    try {
      const command = new QueryCommand({
        TableName: TableNames.UPLOADS,
        IndexName: "StatusIndex",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
      });

      const response = await docClient.send(command);
      return (response.Items || []) as Upload[];
    } catch (error) {
      console.error("Error fetching uploads:", error);
      throw new Error("Failed to fetch uploads");
    }
  }

  static async generateDownloadUrl(uploadId: string): Promise<string> {
    try {
      // First, get the upload details from DynamoDB
      const getUploadCommand = new QueryCommand({
        TableName: TableNames.UPLOADS,
        KeyConditionExpression: "id = :uploadId",
        ExpressionAttributeValues: {
          ":uploadId": uploadId,
        },
      });

      const uploadResponse = await docClient.send(getUploadCommand);
      const upload = uploadResponse.Items?.[0] as Upload;

      if (!upload) {
        throw new Error("Upload not found");
      }

      if (!upload.url) {
        throw new Error("Upload URL not found");
      }

      // Extract the key from the URL
      const urlParts = upload.url.split("/");
      const key = urlParts[urlParts.length - 1];

      // Generate a pre-signed URL for the S3 object
      const command = new GetObjectCommand({
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // URL expires in 1 hour
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating download URL:", error);
      throw new Error("Failed to generate download URL");
    }
  }
}
