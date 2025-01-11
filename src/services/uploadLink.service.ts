import { nanoid } from "nanoid";
import { docClient, TableNames } from "../config/dynamodb";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { followService } from "./follow.service";
import { attendanceService } from "./attendance.service";

export interface UploadLink {
  id: string;
  eventId: string;
  fanId: string;
  creativeId: string;
  expiresAt: string;
  maxUploads: number;
  currentUploads: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TABLE_NAME = TableNames.UPLOAD_LINKS;

export class UploadLinkService {
  async generateLink(
    eventId: string,
    fanId: string,
    creativeId: string,
    options: {
      expirationHours?: number;
      maxUploads?: number;
    } = {}
  ): Promise<UploadLink> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (options.expirationHours || 24) * 60 * 60 * 1000
    );

    const link: UploadLink = {
      id: nanoid(10),
      eventId,
      fanId,
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
        TableName: TABLE_NAME,
        Item: link,
      })
    );

    return link;
  }

  async checkEligibility(
    fanId: string,
    eventId: string,
    creativeId: string
  ): Promise<{ isEligible: boolean; reason?: string }> {
    try {
      // Check if fan is following the creative
      const isFollowing = await followService.checkFollowStatus(
        fanId,
        creativeId
      );
      if (!isFollowing) {
        return {
          isEligible: false,
          reason: "Must follow the creative to get upload access",
        };
      }

      // Check if fan has marked attendance
      const hasAttended = await attendanceService.checkAttendanceStatus(
        fanId,
        eventId
      );
      if (!hasAttended) {
        return {
          isEligible: false,
          reason: "Must mark attendance to get upload access",
        };
      }

      // Check if fan already has an active link
      const existingLinks = await this.getFanEventLinks(fanId, eventId);
      const hasActiveLink = existingLinks.some(
        (link) => link.isActive && new Date(link.expiresAt) > new Date()
      );
      if (hasActiveLink) {
        return {
          isEligible: false,
          reason: "Already has an active upload link",
        };
      }

      return { isEligible: true };
    } catch (error) {
      console.error("Error checking eligibility:", error);
      return {
        isEligible: false,
        reason: "Failed to check eligibility",
      };
    }
  }

  async autoGenerateLink(
    fanId: string,
    eventId: string,
    creativeId: string
  ): Promise<{ link?: UploadLink; error?: string }> {
    try {
      const { isEligible, reason } = await this.checkEligibility(
        fanId,
        eventId,
        creativeId
      );

      if (!isEligible) {
        return { error: reason };
      }

      const link = await this.generateLink(eventId, fanId, creativeId, {
        maxUploads: 10, // Fixed at 10 for MVP
      });

      return { link };
    } catch (error) {
      console.error("Error auto-generating link:", error);
      return {
        error: "Failed to generate upload link",
      };
    }
  }

  async getLink(linkId: string): Promise<UploadLink | undefined> {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: linkId },
      })
    );
    return response.Item as UploadLink | undefined;
  }

  async getFanEventLinks(
    fanId: string,
    eventId: string
  ): Promise<UploadLink[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "FanEventLinksIndex",
        KeyConditionExpression: "fanId = :fanId AND eventId = :eventId",
        ExpressionAttributeValues: {
          ":fanId": fanId,
          ":eventId": eventId,
        },
      })
    );
    return response.Items as UploadLink[];
  }

  async validateLink(
    linkId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    const link = await this.getLink(linkId);

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
  }

  async incrementUploadCount(linkId: string): Promise<void> {
    const link = await this.getLink(linkId);
    if (!link) {
      throw new Error("Upload link not found");
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...link,
          currentUploads: link.currentUploads + 1,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }

  async deactivateLink(linkId: string): Promise<void> {
    const link = await this.getLink(linkId);
    if (!link) {
      throw new Error("Upload link not found");
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...link,
          isActive: false,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }

  async listEventLinks(eventId: string): Promise<UploadLink[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "EventLinksIndex",
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId,
        },
      })
    );
    return response.Items as UploadLink[];
  }
}

export const uploadLinkService = new UploadLinkService();

export const uploadLinkOperations = {
  generateLink: (
    eventId: string,
    fanId: string,
    creativeId: string,
    options?: {
      expirationHours?: number;
      maxUploads?: number;
    }
  ) => uploadLinkService.generateLink(eventId, fanId, creativeId, options),

  checkEligibility: (fanId: string, eventId: string, creativeId: string) =>
    uploadLinkService.checkEligibility(fanId, eventId, creativeId),

  autoGenerateLink: (fanId: string, eventId: string, creativeId: string) =>
    uploadLinkService.autoGenerateLink(fanId, eventId, creativeId),

  getLink: (linkId: string) => uploadLinkService.getLink(linkId),

  incrementUploadCount: (linkId: string) =>
    uploadLinkService.incrementUploadCount(linkId),
};
