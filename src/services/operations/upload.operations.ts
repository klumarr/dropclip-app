import { DynamoDB } from "aws-sdk";
import { UploadItem } from "../../types/uploads";

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = "dev-uploads";

export const uploadOperations = {
  createUpload: async (
    id: string,
    eventId: string,
    userId: string,
    file: File,
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<UploadItem> => {
    // Implementation will depend on your AWS setup
    // This is a placeholder that returns a mock upload
    const upload: UploadItem = {
      id,
      eventId,
      userId,
      eventOwnerId: "", // This should be fetched from the event
      uploaderId: userId,
      uploaderName: "", // This should be fetched from the user
      fileUrl: "",
      fileKey: "",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      fileType: "video",
      fileSize: file.size,
      userEventId: userId,
      uploadDateEventId: `${new Date().toISOString()}#${eventId}`,
    };

    return upload;
  },

  getUpload: async (
    uploadId: string,
    eventId: string
  ): Promise<UploadItem | undefined> => {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: uploadId,
        eventId: eventId,
      },
    };

    const result = await docClient.get(params).promise();
    return result.Item as UploadItem | undefined;
  },

  listEventUploads: async (eventId: string): Promise<UploadItem[]> => {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "eventId = :eventId",
      ExpressionAttributeValues: {
        ":eventId": eventId,
      },
    };

    const result = await docClient.query(params).promise();
    return (result.Items || []) as UploadItem[];
  },

  listUserUploads: async (userId: string): Promise<UploadItem[]> => {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "UserIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await docClient.query(params).promise();
    return (result.Items || []) as UploadItem[];
  },

  updateUploadStatus: async (
    uploadId: string,
    eventId: string,
    status: UploadItem["status"]
  ): Promise<void> => {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: uploadId,
        eventId: eventId,
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    };

    await docClient.update(params).promise();
  },
};
