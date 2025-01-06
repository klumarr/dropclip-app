import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const createUploadsTable = async () => {
  const command = new CreateTableCommand({
    TableName: "dev-uploads",
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
      { AttributeName: "eventId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "eventId", AttributeType: "S" },
      { AttributeName: "userEventId", AttributeType: "S" },
      { AttributeName: "uploadDateEventId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserUploadsIndex",
        KeySchema: [{ AttributeName: "userEventId", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: "DateEventIndex",
        KeySchema: [{ AttributeName: "uploadDateEventId", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  try {
    const response = await client.send(command);
    console.log("Table created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

// Export other table creation functions as needed
