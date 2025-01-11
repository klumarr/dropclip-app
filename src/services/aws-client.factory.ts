import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fetchAuthSession } from "aws-amplify/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import { LambdaClient } from "@aws-sdk/client-lambda";
import {
  region as AWS_REGION,
  userPoolId as USER_POOL_ID,
  identityPoolId as IDENTITY_POOL_ID,
} from "../config/amplify-config";

const providerName = `cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

/**
 * Creates AWS credentials using Cognito Identity Pool
 * Requires authentication for access
 */
const createAWSCredentials = async () => {
  try {
    // Get current session from Amplify Auth
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();

    if (!idToken) {
      throw new Error("Authentication required for AWS access");
    }

    console.log("🔐 Got ID token, creating AWS credentials");

    // Create credentials from Identity Pool with authenticated access
    return fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: AWS_REGION }),
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [providerName]: idToken,
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Authentication required")) {
      throw error; // Re-throw authentication errors
    }
    console.error("❌ Failed to create AWS credentials:", error);
    throw new Error(`AWS credential error: ${error.message}`);
  }
};

/**
 * AWS Client Types supported by the factory
 */
export type AWSClientType =
  | typeof DynamoDBClient
  | typeof S3Client
  | typeof CloudFrontClient
  | typeof LambdaClient;

/**
 * Creates an AWS service client with temporary credentials from Identity Pool
 */
export const createAWSClient = async <T extends AWSClientType>(
  ClientClass: T
): Promise<InstanceType<T>> => {
  try {
    console.log(`🔄 Creating ${ClientClass.name} client...`);
    const credentials = await createAWSCredentials();

    // Always include region in client config
    const clientConfig = {
      region: AWS_REGION,
      credentials,
      maxAttempts: 3,
    };

    console.log(`📍 Using region: ${AWS_REGION}`);
    const client = new ClientClass(clientConfig) as InstanceType<T>;

    console.log(`✅ Successfully created ${ClientClass.name} client`);
    return client;
  } catch (error: any) {
    console.error(`❌ Failed to create ${ClientClass.name} client:`, error);
    throw error;
  }
};

/**
 * Cached clients for better performance
 * Will be refreshed when credentials expire
 */
let cachedClients: Record<string, any> = {};
let lastCredentialRefresh = 0;
const CREDENTIAL_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes

/**
 * Gets or creates an AWS service client with caching
 */
export const getAWSClient = async <T extends AWSClientType>(
  ClientClass: T
): Promise<InstanceType<T>> => {
  const now = Date.now();
  const clientName = ClientClass.name;

  // Check if we need to refresh credentials
  if (now - lastCredentialRefresh > CREDENTIAL_REFRESH_INTERVAL) {
    console.log("🔄 Refreshing cached AWS clients");
    cachedClients = {};
    lastCredentialRefresh = now;
  }

  if (!cachedClients[clientName]) {
    cachedClients[clientName] = await createAWSClient(ClientClass);
  }

  return cachedClients[clientName];
};

/**
 * Clears cached clients - useful when credentials need refresh
 */
export const clearAWSClients = () => {
  console.log("🧹 Clearing cached AWS clients");
  cachedClients = {};
  lastCredentialRefresh = 0;
};
