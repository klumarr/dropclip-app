const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { S3 } = require("@aws-sdk/client-s3");

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const s3 = new S3();

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;

// Helper function to generate response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

// Helper to validate event data
const validateEventData = (eventData) => {
  const errors = [];
  if (!eventData.title) errors.push("Title is required");
  if (!eventData.date) errors.push("Date is required");
  if (!eventData.creativeId) errors.push("Creative ID is required");
  return errors;
};

const handlers = {
  // Create a new event
  async createEvent(eventData) {
    try {
      console.log(
        "Creating event with data:",
        JSON.stringify(eventData, null, 2)
      );

      const errors = validateEventData(eventData);
      if (errors.length > 0) {
        console.log("Validation errors:", errors);
        return createResponse(400, { errors });
      }

      const now = new Date();
      const eventId = `evt_${Date.now()}`;
      const dateId = eventData.date.split("T")[0]; // Extract YYYY-MM-DD

      const item = {
        id: eventId,
        creativeId: eventData.creativeId,
        dateId: dateId,
        dateCreativeId: `${dateId}#${eventData.creativeId}`,
        title: eventData.title,
        date: eventData.date,
        description: eventData.description,
        location: eventData.location,
        capacity: eventData.capacity,
        isPublic: eventData.isPublic,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      console.log("Putting item in DynamoDB:", JSON.stringify(item, null, 2));
      console.log("Using table:", TABLE_NAME);

      const params = {
        TableName: TABLE_NAME,
        Item: item,
      };

      console.log("DynamoDB put params:", JSON.stringify(params, null, 2));
      await dynamodb.put(params);

      console.log("Successfully created event:", JSON.stringify(item, null, 2));
      return createResponse(201, item);
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Error stack:", error.stack);
      return createResponse(500, {
        error: "Failed to create event",
        message: error.message,
        stack: error.stack,
      });
    }
  },

  // Get a single event
  async getEvent(eventId, creativeId) {
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
    });

    if (!result.Item) {
      return createResponse(404, { error: "Event not found" });
    }

    return createResponse(200, result.Item);
  },

  // List events for a creative
  async listEvents(creativeId) {
    const result = await dynamodb.query({
      TableName: TABLE_NAME,
      KeyConditionExpression: "creativeId = :creativeId",
      ExpressionAttributeValues: {
        ":creativeId": creativeId,
      },
    });

    return createResponse(200, result.Items);
  },

  // Update an event
  async updateEvent(eventId, creativeId, updates) {
    // First check if event exists and belongs to creative
    const existing = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
    });

    if (!existing.Item) {
      return createResponse(404, { error: "Event not found" });
    }

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "creativeId") {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update the updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    await dynamodb.update({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    // Get and return the updated item
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
    });

    return createResponse(200, result.Item);
  },

  // Delete an event
  async deleteEvent(eventId, creativeId) {
    // First check if event exists
    const existing = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
    });

    if (!existing.Item) {
      return createResponse(404, { error: "Event not found" });
    }

    // Delete the event
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: eventId, creativeId },
    });

    // If event had an image, delete it from S3
    if (existing.Item.imageUrl) {
      try {
        const imageKey = existing.Item.imageUrl.split("/").pop();
        await s3.deleteObject({
          Bucket: IMAGES_BUCKET,
          Key: imageKey,
        });
      } catch (error) {
        console.error("Error deleting event image:", error);
        // Continue with deletion even if image deletion fails
      }
    }

    return createResponse(200, { message: "Event deleted successfully" });
  },
};

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const { httpMethod, path } = event;
    let body = {};

    try {
      body = event.body ? JSON.parse(event.body) : {};
      console.log("Parsed body:", body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createResponse(400, { error: "Invalid request body" });
    }

    const pathParams = event.pathParameters || {};
    console.log("Path params:", pathParams);

    // Route the request to the appropriate handler
    switch (`${httpMethod} ${path}`) {
      case "POST /events":
        console.log("Handling POST /events");
        return await handlers.createEvent(body);

      case "GET /events":
        return await handlers.listEvents(body.creativeId);

      case "GET /events/{id}":
        return await handlers.getEvent(pathParams.id, body.creativeId);

      case "PUT /events/{id}":
        return await handlers.updateEvent(pathParams.id, body.creativeId, body);

      case "DELETE /events/{id}":
        return await handlers.deleteEvent(pathParams.id, body.creativeId);

      default:
        console.log("Route not found:", `${httpMethod} ${path}`);
        return createResponse(404, { error: "Not Found" });
    }
  } catch (error) {
    console.error("Error in handler:", error);
    console.error("Error stack:", error.stack);
    return createResponse(500, {
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack,
    });
  }
};
