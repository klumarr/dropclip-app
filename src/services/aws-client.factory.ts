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
import {
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity";

const providerName = `cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

/**
 * Creates AWS credentials using Cognito Identity Pool
 * Requires authentication for access
 */
const createAWSCredentials = async () => {
  try {
    // Get current session from Amplify Auth
    const { tokens } = await fetchAuthSession();

    // Ensure we have all required tokens
    if (!tokens?.idToken?.toString()) {
      console.error("❌ No ID token found in session");
      throw new Error("Authentication required: No ID token found");
    }

    const idToken = tokens.idToken.toString();
    console.log("🔐 Got ID token:", idToken.substring(0, 20) + "...");

    // Create Cognito Identity client
    const client = new CognitoIdentityClient({
      region: AWS_REGION,
    });

    // Log the exact configuration being used
    console.log("📝 Identity Pool Configuration:", {
      region: AWS_REGION,
      userPoolId: USER_POOL_ID,
      identityPoolId: IDENTITY_POOL_ID,
      providerName,
    });

    // First get the Identity ID
    const getIdCommand = new GetIdCommand({
      IdentityPoolId: IDENTITY_POOL_ID,
      Logins: {
        [providerName]: idToken,
      },
    });

    const { IdentityId } = await client.send(getIdCommand);

    if (!IdentityId) {
      throw new Error("Failed to get identity ID");
    }

    console.log("✅ Got Identity ID:", IdentityId.substring(0, 10) + "...");

    // Then get credentials for that identity
    const getCredentialsCommand = new GetCredentialsForIdentityCommand({
      IdentityId,
      Logins: {
        [providerName]: idToken,
      },
    });

    const credentialsResult = await client.send(getCredentialsCommand);
    const credentials = credentialsResult.Credentials;

    if (
      !credentials?.AccessKeyId ||
      !credentials?.SecretKey ||
      !credentials?.SessionToken
    ) {
      throw new Error("Invalid credentials received from Cognito Identity");
    }

    // Create AWS credentials provider
    const credentialsProvider = async () => ({
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
      expiration: credentials.Expiration,
    });

    console.log("✅ Successfully obtained AWS credentials");
    return credentialsProvider;
  } catch (error: any) {
    console.error("❌ Error in createAWSCredentials:", {
      error,
      message: error.message,
      region: AWS_REGION,
      userPoolId: USER_POOL_ID,
      identityPoolId: IDENTITY_POOL_ID,
      errorType: error.name,
      errorCode: error.$metadata?.httpStatusCode,
    });
    throw error;
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
  ClientClass: T,
  retryCount = 0
): Promise<InstanceType<T>> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  try {
    console.log(
      `🔄 Creating ${ClientClass.name} client (attempt ${retryCount + 1}/${
        MAX_RETRIES + 1
      })...`
    );

    // Get fresh credentials each time
    const credentials = await createAWSCredentials();

    // Create client with credentials and proper configuration
    const clientConfig = {
      region: AWS_REGION,
      credentials,
      maxAttempts: 3,
      retryMode: "adaptive" as const,
    };

    console.log(`📍 Client Configuration for ${ClientClass.name}:`, {
      region: AWS_REGION,
      maxAttempts: clientConfig.maxAttempts,
      retryMode: clientConfig.retryMode,
    });

    const client = new ClientClass(clientConfig) as InstanceType<T>;

    // Test the client by making a simple request
    try {
      if (client instanceof DynamoDBClient) {
        // Test DynamoDB client specifically
        console.log("🔍 Testing DynamoDB client credentials...");
        const testClient = client as DynamoDBClient;
        const creds = await testClient.config.credentials();

        // Verify we have valid credentials
        if (
          !creds.accessKeyId ||
          !creds.secretAccessKey ||
          !creds.sessionToken
        ) {
          throw new Error("Invalid DynamoDB client credentials");
        }

        console.log("✅ DynamoDB client credentials verified");
      }
      console.log(`✅ Successfully created ${ClientClass.name} client`);
      return client;
    } catch (testError: any) {
      console.error(`❌ Client test failed for ${ClientClass.name}:`, {
        error: testError.message,
        name: testError.name,
        code: testError.$metadata?.httpStatusCode,
        requestId: testError.$metadata?.requestId,
      });
      throw testError;
    }
  } catch (error: any) {
    console.error(`❌ Failed to create ${ClientClass.name} client:`, {
      error: error.message,
      name: error.name,
      attempt: retryCount + 1,
      maxRetries: MAX_RETRIES,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });

    // Retry logic for specific errors
    if (
      retryCount < MAX_RETRIES &&
      (error.message?.includes("NotAuthorizedException") ||
        error.message?.includes("TokenExpired") ||
        error.message?.includes("credentials"))
    ) {
      console.log(`🔄 Retrying in ${RETRY_DELAY}ms...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      clearAWSClients(); // Clear cached clients before retry
      return createAWSClient(ClientClass, retryCount + 1);
    }

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
