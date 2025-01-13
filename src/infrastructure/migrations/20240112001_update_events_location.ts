import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const up = async () => {
  // First, scan all events to get their current location data
  const scanCommand = new ScanCommand({
    TableName: TableNames.EVENTS,
  });

  const response = await docClient.send(scanCommand);
  const events = response.Items || [];

  // Update each event to split location into venue, city, and country
  for (const event of events) {
    if (!event.location) continue;

    // Try to parse the location string
    // Assuming format is "venue, city, country" or just a single location string
    const parts = event.location.split(",").map((part) => part.trim());
    const [venue = event.location, city = "", country = ""] = parts;

    const updateCommand = new UpdateCommand({
      TableName: TableNames.EVENTS,
      Key: {
        id: event.id,
        creativeId: event.creativeId,
      },
      UpdateExpression:
        "SET #venue = :venue, #city = :city, #country = :country REMOVE #location",
      ExpressionAttributeNames: {
        "#venue": "venue",
        "#city": "city",
        "#country": "country",
        "#location": "location",
      },
      ExpressionAttributeValues: {
        ":venue": venue,
        ":city": city,
        ":country": country,
      },
    });

    await docClient.send(updateCommand);
  }

  console.log(`Updated ${events.length} events with new location fields`);
};

export const down = async () => {
  // Scan all events to get their current venue, city, and country data
  const scanCommand = new ScanCommand({
    TableName: TableNames.EVENTS,
  });

  const response = await docClient.send(scanCommand);
  const events = response.Items || [];

  // Update each event to combine venue, city, and country back into location
  for (const event of events) {
    const location = [event.venue, event.city, event.country]
      .filter(Boolean)
      .join(", ");

    const updateCommand = new UpdateCommand({
      TableName: TableNames.EVENTS,
      Key: {
        id: event.id,
        creativeId: event.creativeId,
      },
      UpdateExpression:
        "SET #location = :location REMOVE #venue, #city, #country",
      ExpressionAttributeNames: {
        "#location": "location",
        "#venue": "venue",
        "#city": "city",
        "#country": "country",
      },
      ExpressionAttributeValues: {
        ":location": location,
      },
    });

    await docClient.send(updateCommand);
  }

  console.log(`Reverted ${events.length} events back to single location field`);
};
