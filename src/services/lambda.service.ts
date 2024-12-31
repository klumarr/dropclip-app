import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

export const lambdaOperations = {
  // Invoke a Lambda function
  invokeLambda: async (functionName: string, payload: any): Promise<any> => {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const response = await lambdaClient.send(command);
    if (response.Payload) {
      const result = JSON.parse(Buffer.from(response.Payload).toString());
      if (result.statusCode >= 400) {
        throw new Error(result.body || "Lambda invocation failed");
      }
      return result;
    }
    throw new Error("No response from Lambda");
  },

  // Event creation Lambda invocation
  createEvent: async (eventData: any) => {
    return lambdaOperations.invokeLambda(
      import.meta.env.VITE_AWS_LAMBDA_CREATE_EVENT!,
      {
        body: JSON.stringify(eventData),
      }
    );
  },

  // Video processing trigger Lambda invocation
  triggerVideoProcessing: async (uploadData: any) => {
    return lambdaOperations.invokeLambda(
      import.meta.env.VITE_AWS_LAMBDA_PROCESS_VIDEO!,
      {
        body: JSON.stringify(uploadData),
      }
    );
  },
};
