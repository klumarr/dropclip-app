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
  PutCommand,
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
const getAllowedOrigins = () => {
  const origins = [
    // Development origins
    "http://localhost:5174",
    "https://localhost:5174",

    // Local network origins
    "http://192.168.*",
    "https://192.168.*",
    "http://172.16.*",
    "https://172.16.*",
    "http://10.*",
    "https://10.*",

    // Tunnel services
    "https://*.ngrok-free.app",
    "https://*.localhost.run",
    "http://*.localhost.run",
    "https://*.lhr.life",
    "http://*.lhr.life",
  ];
  return origins;
};

const isOriginAllowed = (origin) => {
  if (!origin) {
    console.log("❌ No origin provided");
    return false;
  }

  console.log("🔍 Checking origin:", origin);

  // Check if origin matches any of our patterns
  for (const pattern of getAllowedOrigins()) {
    console.log(`\n📝 Testing pattern: ${pattern}`);

    // If pattern has no wildcard, do exact match
    if (!pattern.includes("*")) {
      const matches = origin === pattern;
      console.log(`   Exact match test: ${matches}`);
      if (matches) return true;
      continue;
    }

    // Convert the pattern to a regex
    // First escape all special regex characters except *
    const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    // Then replace * with .* to match any characters
    const regexPattern = escapedPattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);

    console.log(`   Regex pattern: ${regex}`);
    const matches = regex.test(origin);
    console.log(`   Regex match: ${matches}`);

    if (matches) {
      console.log("✅ Found matching pattern!");
      return true;
    }
  }

  console.log("❌ No matching pattern found");
  return false;
};

const corsHeaders = (origin) => {
  // If no origin provided, use localhost as fallback
  if (!origin) {
    console.log("⚠️ No origin provided, using localhost fallback");
    origin = "http://localhost:5174";
  }

  const isAllowed = isOriginAllowed(origin);

  // Log the origin and whether it's allowed
  console.log("🌐 CORS Check:", {
    receivedOrigin: origin,
    isAllowed,
    allowedPatterns: getAllowedOrigins(),
    willUseOrigin: isAllowed ? origin : origin, // Always use the actual origin
  });

  // When using credentials, we must return the actual origin
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "3600",
    "Access-Control-Expose-Headers":
      "Date,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent,Content-Type,Content-Length",
    "Content-Type": "application/json",
    Vary: "Origin",
  };

  console.log("🔧 Returning CORS headers:", headers);

  return headers;
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
    console.log("🔍 Ownership verification started:", { eventId, userId });

    // First try to get the event with just the id to check if it exists
    const getByIdCommand = new GetCommand({
      TableName: EVENTS_TABLE_NAME,
      Key: { id: eventId },
    });

    const eventResult = await docClient.send(getByIdCommand);
    console.log("📦 Event lookup result:", {
      found: !!eventResult.Item,
      eventId,
      eventUserId: eventResult.Item?.user_id,
      requestingUserId: userId,
      item: eventResult.Item,
    });

    if (!eventResult.Item) {
      console.log("❌ Event not found:", eventId);
      return false;
    }

    // Check if the user_id matches
    const isOwner = eventResult.Item.user_id === userId;
    console.log("🔐 Ownership check:", {
      isOwner,
      eventUserId: eventResult.Item.user_id,
      requestingUserId: userId,
    });

    return isOwner;
  } catch (error) {
    console.error("❌ Error verifying event ownership:", error);
    return false;
  }
};

const verifyAuthorization = (event) => {
  console.log("🔒 Verifying authorization:", {
    claims: event.requestContext?.authorizer?.claims,
    scopes: event.requestContext?.authorizer?.claims?.scope,
  });

  // Check if we have valid claims
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims || !claims.sub) {
    console.log("❌ Missing required claims");
    return false;
  }

  // Check if token is not expired
  const exp = claims.exp ? parseInt(claims.exp) : 0;
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) {
    console.log("❌ Token expired");
    return false;
  }

  return true;
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
        headers: corsHeaders(event.headers?.origin),
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
        headers: corsHeaders(event.headers?.origin),
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
      console.log("🛠️ Processing PUT/DELETE request:", {
        method: event.httpMethod,
        pathParameters: event.pathParameters,
        userId: userId,
        authorizerClaims: event.requestContext?.authorizer?.claims,
        authHeader: event.headers?.Authorization?.substring(0, 20) + "...",
      });

      // First verify authorization
      if (!verifyAuthorization(event)) {
        return {
          statusCode: 403,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Unauthorized - Invalid or expired token",
            debug: {
              hasAuthorizer: !!event.requestContext?.authorizer,
              hasClaims: !!event.requestContext?.authorizer?.claims,
              timestamp: new Date().toISOString(),
            },
          }),
        };
      }

      const eventId = event.pathParameters?.eventId;
      if (!eventId) {
        console.log("❌ No event ID in path parameters");
        return {
          statusCode: 400,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({ message: "Event ID is required" }),
        };
      }

      // Then verify ownership
      console.log("🔑 Starting ownership verification for:", {
        eventId,
        userId,
        headers: event.headers,
        claims: event.requestContext?.authorizer?.claims,
      });

      const isOwner = await verifyEventOwnership(eventId, userId);

      console.log("✅ Ownership verification result:", {
        isOwner,
        eventId,
        userId,
      });

      if (!isOwner) {
        return {
          statusCode: 403,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Forbidden - You don't own this event",
          }),
        };
      }

      if (event.httpMethod === "PUT") {
        try {
          console.log("📝 PUT request details:", {
            eventId,
            userId,
            requestContext: event.requestContext,
            claims: event.requestContext?.authorizer?.claims,
            headers: event.headers,
          });

          const updateData = JSON.parse(event.body);
          console.log("📦 Update data:", updateData);

          // First, get the existing event to preserve user_id
          const getCommand = new GetCommand({
            TableName: EVENTS_TABLE_NAME,
            Key: { id: eventId },
          });

          const existingEvent = await docClient.send(getCommand);
          console.log("📋 Existing event:", existingEvent.Item);

          if (!existingEvent.Item) {
            return {
              statusCode: 404,
              headers: corsHeaders(event.headers?.origin),
              body: JSON.stringify({
                message: "Event not found",
              }),
            };
          }

          // Filter out key attributes and unchanged values
          const filteredUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(
              ([key]) =>
                key !== "id" && key !== "user_id" && key !== "_metadata"
            )
          );

          // Create update expression and attribute values
          const updateExpression = [];
          const expressionAttributeValues = {};
          const expressionAttributeNames = {};

          Object.entries(filteredUpdateData).forEach(([key, value]) => {
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
            expressionAttributeNames[`#${key}`] = key;
          });

          // Only proceed if there are attributes to update
          if (updateExpression.length === 0) {
            return {
              statusCode: 400,
              headers: corsHeaders(event.headers?.origin),
              body: JSON.stringify({
                message: "No valid attributes to update",
              }),
            };
          }

          console.log("🔧 Update command:", {
            updateExpression: `SET ${updateExpression.join(", ")}`,
            expressionAttributeValues,
            expressionAttributeNames,
          });

          const command = new UpdateCommand({
            TableName: EVENTS_TABLE_NAME,
            Key: {
              id: eventId,
              user_id: existingEvent.Item.user_id,
            },
            UpdateExpression: `SET ${updateExpression.join(", ")}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: "ALL_NEW",
          });

          console.log("🔄 Executing update with key:", command.input.Key);

          const result = await docClient.send(command);
          console.log("✅ Update result:", result);

          return {
            statusCode: 200,
            headers: corsHeaders(event.headers?.origin),
            body: JSON.stringify({
              message: "Event updated successfully",
              event: result.Attributes,
            }),
          };
        } catch (error) {
          console.error("❌ Error in PUT request:", error);
          return {
            statusCode: 500,
            headers: corsHeaders(event.headers?.origin),
            body: JSON.stringify({
              message: "Error updating event",
              error: error.message || "Unknown error",
            }),
          };
        }
      }

      if (event.httpMethod === "DELETE") {
        const command = new DeleteCommand({
          TableName: EVENTS_TABLE_NAME,
          Key: {
            id: eventId,
            user_id: userId,
          },
          ReturnValues: "ALL_OLD",
        });

        await docClient.send(command);

        return {
          statusCode: 200,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Event deleted successfully",
            eventId,
          }),
        };
      }
    }

    // Handle POST request for creating events
    if (event.httpMethod === "POST") {
      console.log("🛠️ Processing POST request:", {
        userId: userId,
        authorizerClaims: event.requestContext?.authorizer?.claims,
        authHeader: event.headers?.Authorization?.substring(0, 20) + "...",
        body: event.body,
        headers: event.headers,
        isBase64Encoded: event.isBase64Encoded,
        contentType: event.headers?.["content-type"],
        contentLength: event.headers?.["content-length"],
      });

      // First verify authorization
      if (!verifyAuthorization(event)) {
        console.log("❌ Authorization failed:", {
          hasAuthorizer: !!event.requestContext?.authorizer,
          hasClaims: !!event.requestContext?.authorizer?.claims,
          claims: event.requestContext?.authorizer?.claims,
          userId: userId,
        });
        return {
          statusCode: 403,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Unauthorized - Invalid or expired token",
            debug: {
              hasAuthorizer: !!event.requestContext?.authorizer,
              hasClaims: !!event.requestContext?.authorizer?.claims,
              timestamp: new Date().toISOString(),
              userId: userId,
              claims: event.requestContext?.authorizer?.claims,
            },
          }),
        };
      }

      try {
        // Handle potential base64 encoding
        let eventData;
        try {
          if (event.isBase64Encoded) {
            console.log("📦 Decoding base64 body");
            const decodedBody = Buffer.from(event.body, "base64").toString(
              "utf8"
            );
            console.log("📦 Decoded body:", decodedBody);
            eventData = JSON.parse(decodedBody);
          } else {
            console.log("📦 Parsing JSON body:", event.body);
            eventData = JSON.parse(event.body);
          }
        } catch (parseError) {
          console.error("❌ Failed to parse event body:", {
            body: event.body,
            error: parseError,
            isBase64Encoded: event.isBase64Encoded,
            bodyType: typeof event.body,
          });
          return {
            statusCode: 400,
            headers: corsHeaders(event.headers?.origin),
            body: JSON.stringify({
              message: "Invalid request body",
              error: parseError.message,
              debug: {
                body: event.body,
                isBase64Encoded: event.isBase64Encoded,
                bodyType: typeof event.body,
              },
            }),
          };
        }

        console.log("📦 Event data after parsing:", eventData);

        // Validate required fields
        const requiredFields = ["title", "date", "location"];
        const missingFields = requiredFields.filter(
          (field) => !eventData[field]
        );

        if (missingFields.length > 0) {
          console.log("❌ Missing required fields:", {
            missingFields,
            receivedData: eventData,
          });
          return {
            statusCode: 400,
            headers: corsHeaders(event.headers?.origin),
            body: JSON.stringify({
              message: "Missing required fields",
              fields: missingFields,
              receivedData: eventData,
            }),
          };
        }

        // Add user_id and timestamps
        const newEvent = {
          ...eventData,
          id: Date.now().toString(), // Ensure we have an ID
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Ensure optional fields have default values
          startTime: eventData.startTime || "",
          endTime: eventData.endTime || "",
          description: eventData.description || "",
          ticketLink: eventData.ticketLink || "",
          isAutomatic: eventData.isAutomatic || false,
          uploadConfig: eventData.uploadConfig || {
            enabled: false,
            allowedTypes: ["image/*"],
            maxFileSize: 5,
          },
        };

        // Create event in DynamoDB
        const command = {
          TableName: EVENTS_TABLE_NAME,
          Item: newEvent,
        };

        console.log("🔧 Creating event with command:", command);
        await docClient.send(new PutCommand(command));

        return {
          statusCode: 201,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Event created successfully",
            event: newEvent,
          }),
        };
      } catch (error) {
        console.error("❌ Error in POST request:", error);
        return {
          statusCode: 500,
          headers: corsHeaders(event.headers?.origin),
          body: JSON.stringify({
            message: "Error creating event",
            error: error.message || "Unknown error",
            debug: {
              userId: userId,
              claims: event.requestContext?.authorizer?.claims,
              headers: event.headers,
            },
          }),
        };
      }
    }

    // Original GET logic    // Original GET logic
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
        headers: corsHeaders(event.headers?.origin),
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
      headers: corsHeaders(event.headers?.origin),
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
      headers: corsHeaders(event.headers?.origin),
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
