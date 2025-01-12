import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import env from "./env.config";
import { TableNames } from "./dynamodb";

// Log AWS configuration
console.log("AWS Configuration:", {
  region: env.aws.region,
  userPoolId: env.aws.userPoolId,
  userPoolClientId: env.aws.userPoolClientId,
  identityPoolId: env.aws.identityPoolId,
});

// Create Cognito Identity client
export const cognitoIdentityClient = new CognitoIdentityClient({
  region: env.aws.region,
});

// Create DynamoDB client with Cognito Identity Pool credentials
export const dynamoDBClient = new DynamoDBClient({
  region: env.aws.region,
  credentials: fromCognitoIdentityPool({
    client: cognitoIdentityClient,
    identityPoolId: env.aws.identityPoolId!,
  }),
  maxAttempts: 3,
});

// Create DynamoDB Document client with improved marshalling options
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

// Export table names for consistency
export const tables = {
  EVENTS: TableNames.EVENTS,
  UPLOADS: TableNames.UPLOADS,
  USERS: TableNames.USERS,
  CONTENT: TableNames.CONTENT,
  COLLECTIONS: TableNames.COLLECTIONS,
  PLAYLISTS: TableNames.PLAYLISTS,
  USER_PROFILES: TableNames.USER_PROFILES,
  FOLLOWS: TableNames.FOLLOWS,
  UPLOAD_LINKS: TableNames.UPLOAD_LINKS,
  ATTENDANCE: TableNames.ATTENDANCE,
  COLLECTION_UPLOADS: TableNames.COLLECTION_UPLOADS,
};
