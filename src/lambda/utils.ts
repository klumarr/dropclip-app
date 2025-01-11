import { APIGatewayProxyEvent } from "aws-lambda";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT,DELETE",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

export const verifyAuthorization = (
  event: APIGatewayProxyEvent
): string | null => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error("Failed to verify token:", error);
    return null;
  }
};

export const getUserIdFromEvent = (
  event: APIGatewayProxyEvent
): string | null => {
  const userId = verifyAuthorization(event);
  if (!userId) {
    console.error("No valid authorization token found");
    return null;
  }
  return userId;
};

export const createResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

export const handleError = (error: Error) => {
  console.error("Error:", error);
  return createResponse(500, {
    message: "Internal server error",
    error: error.message,
  });
};
