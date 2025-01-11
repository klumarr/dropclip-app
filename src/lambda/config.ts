// Environment variables
export const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
export const AWS_REGION = process.env.AWS_REGION || "us-east-1";
export const EVENTS_TABLE = process.env.EVENTS_TABLE || "events";
export const USERS_TABLE = process.env.USERS_TABLE || "users";

// DynamoDB configuration
export const dynamoConfig = {
  region: AWS_REGION,
  ...(process.env.IS_OFFLINE
    ? {
        endpoint: "http://localhost:8000",
        credentials: {
          accessKeyId: "DEFAULT_ACCESS_KEY",
          secretAccessKey: "DEFAULT_SECRET",
        },
      }
    : {}),
};

// API configuration
export const API_VERSION = "v1";
export const MAX_ITEMS_PER_PAGE = 50;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  INVALID_TOKEN: "Invalid or expired token",
  USER_NOT_FOUND: "User not found",
  EVENT_NOT_FOUND: "Event not found",
  INTERNAL_ERROR: "Internal server error",
  INVALID_REQUEST: "Invalid request parameters",
};
