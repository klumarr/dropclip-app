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
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

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
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
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
  // Log the full event for debugging
  console.log("Full event for debugging:", JSON.stringify(event, null, 2));

  // Try to get user ID from Cognito authorizer first
  const cognitoSub = event.requestContext?.authorizer?.claims?.sub;
  if (cognitoSub) {
    console.log("Found user ID in Cognito claims:", cognitoSub);
    return cognitoSub;
  }

  // Try to decode JWT from Authorization header
  const authHeader = event.headers?.Authorization;
  if (authHeader) {
    const decodedToken = decodeJWT(authHeader);
    if (decodedToken?.sub) {
      console.log("Found user ID in JWT token:", decodedToken.sub);
      return decodedToken.sub;
    }
  }

  // Try fallback options
  const fallbackId =
    event.headers?.["x-user-id"] ||
    event.requestContext?.authorizer?.userId ||
    event.requestContext?.authorizer?.["cognito:username"];

  console.log("Fallback user ID:", fallbackId);
  return fallbackId;
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

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === "OPTIONS") {
      console.log("Handling OPTIONS request");
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    // Get user ID using the helper function
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

    // Test DynamoDB permissions first
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

    // Fetch events from DynamoDB
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

    try {
      // Ensure events are serializable
      const events = (result?.Items || []).map((item) => ({
        ...item,
        _metadata: undefined, // Remove any internal DynamoDB metadata
      }));

      // Format response for API Gateway
      const responseBody = JSON.stringify({
        events,
        message: "Events retrieved successfully",
      });

      // Test that the response can be parsed back
      JSON.parse(responseBody);

      const response = {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        body: responseBody,
        isBase64Encoded: false,
      };

      console.log("Sending response:", JSON.stringify(response, null, 2));
      return response;
    } catch (serializationError) {
      console.error("Error serializing response:", serializationError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Error formatting response",
          error: serializationError?.message || "Unknown serialization error",
        }),
        isBase64Encoded: false,
      };
    }
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
