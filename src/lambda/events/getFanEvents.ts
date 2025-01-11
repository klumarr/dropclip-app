import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { eventOperations } from "../../services/eventsService";
import { corsHeaders } from "../utils/cors";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract user ID from the request context
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Unauthorized - User ID not found" }),
      };
    }

    const events = await eventOperations.listEvents(userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(events),
    };
  } catch (error) {
    console.error("Error fetching events:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to fetch events" }),
    };
  }
};
