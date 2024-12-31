import { nanoid } from "nanoid";
import { docClient, TableNames } from "../config/dynamodb";
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export interface UploadLink {
  id: string;
  eventId: string;
  creativeId: string;
  expiresAt: string;
  maxUploads: number;
  currentUploads: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const uploadLinkOperations = {
  generateLink: async (
    eventId: string,
    creativeId: string,
    options: {
      expirationHours?: number;
      maxUploads?: number;
    } = {}
  ): Promise<UploadLink> => {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (options.expirationHours || 24) * 60 * 60 * 1000
    );

    const link: UploadLink = {
      id: nanoid(10), // Short but unique ID
      eventId,
      creativeId,
      expiresAt: expiresAt.toISOString(),
      maxUploads: options.maxUploads || 10,
      currentUploads: 0,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TableNames.UPLOAD_LINKS,
        Item: link,
      })
    );

    return link;
  },

  getLink: async (linkId: string): Promise<UploadLink | undefined> => {
    const response = await docClient.send(
      new GetCommand({
        TableName: TableNames.UPLOAD_LINKS,
        Key: { id: linkId },
      })
    );
    return response.Item as UploadLink | undefined;
  },

  validateLink: async (
    linkId: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    const link = await uploadLinkOperations.getLink(linkId);

    if (!link) {
      return { isValid: false, error: "Upload link not found" };
    }

    if (!link.isActive) {
      return { isValid: false, error: "Upload link is inactive" };
    }

    if (new Date(link.expiresAt) < new Date()) {
      return { isValid: false, error: "Upload link has expired" };
    }

    if (link.currentUploads >= link.maxUploads) {
      return { isValid: false, error: "Maximum uploads reached" };
    }

    return { isValid: true };
  },

  incrementUploadCount: async (linkId: string): Promise<void> => {
    const link = await uploadLinkOperations.getLink(linkId);
    if (!link) {
      throw new Error("Upload link not found");
    }

    await docClient.send(
      new PutCommand({
        TableName: TableNames.UPLOAD_LINKS,
        Item: {
          ...link,
          currentUploads: link.currentUploads + 1,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  },

  listEventLinks: async (eventId: string): Promise<UploadLink[]> => {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TableNames.UPLOAD_LINKS,
        IndexName: "EventLinksIndex",
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId,
        },
      })
    );
    return response.Items as UploadLink[];
  },

  deactivateLink: async (linkId: string): Promise<void> => {
    const link = await uploadLinkOperations.getLink(linkId);
    if (!link) {
      throw new Error("Upload link not found");
    }

    await docClient.send(
      new PutCommand({
        TableName: TableNames.UPLOAD_LINKS,
        Item: {
          ...link,
          isActive: false,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  },
};
