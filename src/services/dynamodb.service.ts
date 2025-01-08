import env from "../config/env.config";

interface QueryParams {
  TableName: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: Record<string, any>;
}

export const dynamoDBService = {
  async query(params: QueryParams) {
    try {
      const response = await fetch(`${env.api.endpoint}/dynamodb/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to query DynamoDB");
      }

      return await response.json();
    } catch (error) {
      console.error("Error querying DynamoDB:", error);
      throw error;
    }
  },

  async getItem(tableName: string, key: Record<string, any>) {
    try {
      const response = await fetch(`${env.api.endpoint}/dynamodb/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TableName: tableName,
          Key: key,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get item from DynamoDB");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting item from DynamoDB:", error);
      throw error;
    }
  },

  async putItem(tableName: string, item: Record<string, any>) {
    try {
      const response = await fetch(`${env.api.endpoint}/dynamodb/put`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TableName: tableName,
          Item: item,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to put item in DynamoDB");
      }

      return await response.json();
    } catch (error) {
      console.error("Error putting item in DynamoDB:", error);
      throw error;
    }
  },
};
