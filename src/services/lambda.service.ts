import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { getCredentials } from "./auth.service";
import { region as AWS_REGION } from "../config/amplify-config";

// Function to invoke Lambda functions
export const invokeLambda = async (functionName: string, payload: any) => {
  try {
    // Get AWS credentials
    const credentials = await getCredentials();

    // Create Lambda client with credentials
    const client = new LambdaClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    // Create command with function name and payload
    const command = new InvokeCommand({
      FunctionName: `${import.meta.env.VITE_FUNCTION_PREFIX}-${functionName}`,
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    // Invoke Lambda function
    const response = await client.send(command);

    // Check for function error
    if (response.FunctionError) {
      throw new Error(`Lambda function error: ${response.FunctionError}`);
    }

    // Parse and return response
    if (response.Payload) {
      const result = Buffer.from(response.Payload).toString();
      return JSON.parse(result);
    }

    throw new Error("No response payload from Lambda function");
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
};

export const lambdaOperations = {
  triggerVideoProcessing: async ({
    uploadId,
    eventId,
    fileKey,
    options,
  }: {
    uploadId: string;
    eventId: string;
    fileKey: string;
    options?: any;
  }) => {
    return invokeLambda("processVideo", {
      action: "processVideo",
      uploadId,
      eventId,
      fileKey,
      options,
    });
  },

  cancelVideoProcessing: async (
    uploadId: string,
    bucket: string,
    key: string
  ) => {
    return invokeLambda("cancelProcessing", {
      action: "cancelProcessing",
      uploadId,
      bucket,
      key,
    });
  },
};
