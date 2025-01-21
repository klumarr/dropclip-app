import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

let authenticatedClient: DynamoDBDocumentClient | null = null;
let unauthenticatedClient: DynamoDBDocumentClient | null = null;

export async function getAuthenticatedClient(): Promise<DynamoDBDocumentClient> {
  if (authenticatedClient) return authenticatedClient;

  try {
    console.log("🔄 Creating authenticated DynamoDB client...");
    const region = import.meta.env.VITE_AWS_REGION;
    const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

    if (!region || !identityPoolId) {
      throw new Error("Missing required AWS configuration");
    }

    // Get the current authenticated user's JWT token
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();

    if (!idToken) {
      throw new Error("No authenticated user session");
    }

    // Configure credentials with the user's identity
    const credentials = fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId,
      logins: {
        [`cognito-idp.${region}.amazonaws.com/${
          import.meta.env.VITE_USER_POOL_ID
        }`]: idToken,
      },
    });

    const client = new DynamoDBClient({
      region,
      credentials,
    });

    authenticatedClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });

    console.log("✅ Successfully created authenticated DynamoDB client");
    return authenticatedClient;
  } catch (error) {
    console.error("❌ Failed to create authenticated client:", error);
    throw new Error("Failed to initialize authenticated database connection");
  }
}

export async function getUnauthenticatedClient(): Promise<DynamoDBDocumentClient> {
  if (unauthenticatedClient) return unauthenticatedClient;

  try {
    console.log("🔄 Creating unauthenticated DynamoDB client...");
    const region = import.meta.env.VITE_AWS_REGION;
    const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

    if (!region || !identityPoolId) {
      throw new Error("Missing required AWS configuration");
    }

    const credentials = fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId,
    });

    const client = new DynamoDBClient({
      region,
      credentials,
    });

    unauthenticatedClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });

    console.log("✅ Successfully created unauthenticated DynamoDB client");
    return unauthenticatedClient;
  } catch (error) {
    console.error("❌ Failed to create unauthenticated client:", error);
    throw new Error("Failed to initialize unauthenticated database connection");
  }
}

// Clear clients when needed (e.g., on logout)
export function clearClients() {
  authenticatedClient = null;
  unauthenticatedClient = null;
}
