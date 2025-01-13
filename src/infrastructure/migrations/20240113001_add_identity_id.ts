import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../config/dynamodb";
import { getCredentials } from "../../services/auth.service";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const up = async () => {
  // First, get the current identity ID
  const credentials = await getCredentials();
  const identityId = credentials.identityId;

  // Scan all events to add identityId
  const scanCommand = new ScanCommand({
    TableName: TableNames.EVENTS,
  });

  const response = await docClient.send(scanCommand);
  const events = response.Items || [];

  // Update each event to add identityId
  for (const event of events) {
    const updateCommand = new UpdateCommand({
      TableName: TableNames.EVENTS,
      Key: {
        id: event.id,
        creativeId: event.creativeId,
      },
      UpdateExpression: "SET #identityId = :identityId",
      ExpressionAttributeNames: {
        "#identityId": "identityId",
      },
      ExpressionAttributeValues: {
        ":identityId": identityId,
      },
    });

    await docClient.send(updateCommand);
  }

  console.log(`Updated ${events.length} events with identityId field`);
};

export const down = async () => {
  // Scan all events to remove identityId
  const scanCommand = new ScanCommand({
    TableName: TableNames.EVENTS,
  });

  const response = await docClient.send(scanCommand);
  const events = response.Items || [];

  // Update each event to remove identityId
  for (const event of events) {
    const updateCommand = new UpdateCommand({
      TableName: TableNames.EVENTS,
      Key: {
        id: event.id,
        creativeId: event.creativeId,
      },
      UpdateExpression: "REMOVE #identityId",
      ExpressionAttributeNames: {
        "#identityId": "identityId",
      },
    });

    await docClient.send(updateCommand);
  }

  console.log(`Removed identityId field from ${events.length} events`);
};
