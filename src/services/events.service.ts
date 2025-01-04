// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚠️ IMPORTANT: DO NOT MODIFY THIS FILE WITHOUT CAREFUL CONSIDERATION ⚠️
 * This Lambda function is intentionally using loose typing to work with API Gateway.
 * Any TypeScript strict typing rules are deliberately disabled for compatibility.
 * Modifications could break the API Gateway integration.
 * Last working state: January 3, 2025
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const EVENTS_TABLE_NAME = process.env.EVENTS_TABLE_NAME || "dropclip-events";

// Initialize DynamoDB clients
let client;
let docClient;

try {
  console.log("Environment variables:", {
    AWS_REGION: process.env.AWS_REGION,
    EVENTS_TABLE_NAME: process.env.EVENTS_TABLE_NAME,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    AWS_LAMBDA_FUNCTION_VERSION: process.env.AWS_LAMBDA_FUNCTION_VERSION,
  });

  client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
  });
  docClient = DynamoDBDocumentClient.from(client);
  console.log("DynamoDB clients initialized successfully");
} catch (error) {
  console.error("Error initializing DynamoDB clients:", error);
  throw error;
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5174",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
  "Access-Control-Max-Age": "3600",
  "Access-Control-Expose-Headers":
    "Date,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent,Content-Type,Content-Length",
};

const decodeJWT = (authHeader) => {
  try {
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Auth header does not start with Bearer");
      return null;
    }
    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    console.log("Decoded payload:", payload);
    return payload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const getUserIdFromEvent = (event) => {
  console.log("Full event for debugging:", JSON.stringify(event, null, 2));

  const cognitoSub = event.requestContext?.authorizer?.claims?.sub;
  if (cognitoSub) {
    console.log("Found user ID in Cognito claims:", cognitoSub);
    return cognitoSub;
  }

  const authHeader = event.headers?.Authorization;
  if (authHeader) {
    const decodedToken = decodeJWT(authHeader);
    if (decodedToken?.sub) {
      console.log("Found user ID in JWT token:", decodedToken.sub);
      return decodedToken.sub;
    }
  }

  const fallbackId =
    event.headers?.["x-user-id"] ||
    event.requestContext?.authorizer?.userId ||
    event.requestContext?.authorizer?.["cognito:username"];

  console.log("Fallback user ID:", fallbackId);
  return fallbackId;
};

const verifyEventOwnership = async (eventId, userId) => {
  try {
    console.log("Verifying event ownership:", { eventId, userId });

    // First try to get the event with both id and user_id
    const getCommand = new GetCommand({
      TableName: EVENTS_TABLE_NAME,
      Key: {
        id: eventId,
        user_id: userId,
      },
    });

    console.log("Executing GetCommand with key:", getCommand.input.Key);

    const result = await docClient.send(getCommand);
    console.log("Get event result:", {
      hasItem: !!result.Item,
      item: result.Item,
      eventId,
      userId,
    });

    if (!result.Item) {
      console.log(
        "Event not found with composite key, checking if event exists at all"
      );

      // If not found, check if the event exists with just the id
      const fallbackCommand = new GetCommand({
        TableName: EVENTS_TABLE_NAME,
        Key: { id: eventId },
      });

      const fallbackResult = await docClient.send(fallbackCommand);
      console.log("Fallback get event result:", {
        hasItem: !!fallbackResult.Item,
        item: fallbackResult.Item,
        eventId,
      });

      if (!fallbackResult.Item) {
        console.log("Event not found at all");
        return false;
      }

      // If event exists but user_id doesn't match
      console.log("Event exists but ownership verification failed:", {
        eventUserId: fallbackResult.Item.user_id,
        requestingUserId: userId,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying event ownership:", error);
    return false;
  }
};

export const handler = async (event) => {
  try {
    console.log("Lambda handler started with event:", {
      level: "DEBUG",
      event: JSON.stringify(event, null, 2),
      eventType: typeof event,
      headers: event?.headers,
      requestContext: event?.requestContext,
      httpMethod: event?.httpMethod,
    });

    if (event.httpMethod === "OPTIONS") {
      console.log("Handling OPTIONS request");
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    const userId = getUserIdFromEvent(event);

    console.log("Auth debug:", {
      requestContext: event.requestContext,
      authorizer: event.requestContext?.authorizer,
      claims: event.requestContext?.authorizer?.claims,
      headers: event.headers,
      userId: userId,
    });

    if (!userId) {
      console.error("No user ID found", {
        authorizer: event.requestContext?.authorizer,
        headers: event.headers,
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Unauthorized - No user ID found",
          debug: {
            authorizer: event.requestContext?.authorizer,
            headers: event.headers,
          },
        }),
      };
    }

    // Handle different HTTP methods
    if (event.httpMethod === "PUT" || event.httpMethod === "DELETE") {
      const eventId = event.pathParameters?.eventId;
      if (!eventId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Event ID is required" }),
        };
      }

      // Verify event ownership
      const isOwner = await verifyEventOwnership(eventId, userId);
      if (!isOwner) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Forbidden - You don't own this event",
          }),
        };
      }

      if (event.httpMethod === "PUT") {
        const updateData = JSON.parse(event.body);
        console.log("Update data:", updateData);

        // Create update expression and attribute values
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        Object.entries(updateData).forEach(([key, value]) => {
          if (key !== "id" && key !== "user_id") {
            // Prevent updating these fields
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
            expressionAttributeNames[`#${key}`] = key;
          }
        });

        const command = new UpdateCommand({
          TableName: EVENTS_TABLE_NAME,
          Key: {
            id: eventId,
            user_id: userId,
          },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: expressionAttributeNames,
          ReturnValues: "ALL_NEW",
        });

        console.log("Update command:", {
          key: command.input.Key,
          updateExpression: command.input.UpdateExpression,
          expressionAttributeValues: command.input.ExpressionAttributeValues,
          expressionAttributeNames: command.input.ExpressionAttributeNames,
        });

        const result = await docClient.send(command);
        console.log("Update result:", result);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Event updated successfully",
            event: result.Attributes,
          }),
        };
      }

      if (event.httpMethod === "DELETE") {
        console.log("Deleting event:", { eventId, userId });

        const command = new DeleteCommand({
          TableName: EVENTS_TABLE_NAME,
          Key: {
            id: eventId,
            user_id: userId,
          },
          ReturnValues: "ALL_OLD",
        });

        console.log("Delete command:", {
          key: command.input.Key,
        });

        const result = await docClient.send(command);
        console.log("Delete result:", result);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Event deleted successfully",
            event: result.Attributes,
          }),
        };
      }
    }

    // Original GET logic
    try {
      console.log("Testing DynamoDB permissions...");
      const testCommand = new ScanCommand({
        TableName: EVENTS_TABLE_NAME,
        Limit: 1,
      });
      await docClient.send(testCommand);
      console.log("DynamoDB permissions test successful");
    } catch (dbError) {
      console.error("DynamoDB permissions test failed:", dbError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Database access error",
          error: dbError?.message || "Unknown database error",
          errorType: dbError?.name || "Unknown",
          tableName: EVENTS_TABLE_NAME,
        }),
      };
    }

    console.log("Creating DynamoDB command for user:", userId);
    const command = new ScanCommand({
      TableName: EVENTS_TABLE_NAME,
      FilterExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });

    console.log("DynamoDB command:", JSON.stringify(command, null, 2));
    console.log("Sending command to DynamoDB...");
    const result = await docClient.send(command);
    console.log("DynamoDB result:", JSON.stringify(result, null, 2));

    const events = (result?.Items || []).map((item) => ({
      ...item,
      _metadata: undefined,
    }));

    const responseBody = JSON.stringify({
      events,
      message: "Events retrieved successfully",
    });

    JSON.parse(responseBody);

    const response = {
      statusCode: 200,
      headers: corsHeaders,
      body: responseBody,
      isBase64Encoded: false,
    };

    console.log("Sending response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Error in Lambda handler:", error);
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: error?.message || "Unknown error",
        errorType: error?.name || "Unknown",
        debug: {
          tableName: EVENTS_TABLE_NAME,
          region: process.env.AWS_REGION,
        },
      }),
    };
  }
};
