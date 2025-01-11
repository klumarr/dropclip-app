import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const cloudfrontClient = new CloudFrontClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

const DISTRIBUTION_ID = import.meta.env.VITE_AWS_CLOUDFRONT_DISTRIBUTION_ID;
const DISTRIBUTION_DOMAIN = import.meta.env.VITE_AWS_CLOUDFRONT_DOMAIN;

export const cloudfrontOperations = {
  // Get the CloudFront URL for a file
  getFileUrl: (key: string): string => {
    return `https://${DISTRIBUTION_DOMAIN}/${key}`;
  },

  // Invalidate CloudFront cache for specific paths
  invalidateCache: async (paths: string[]): Promise<void> => {
    const command = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: paths.length,
          Items: paths.map((path) =>
            path.startsWith("/") ? path : `/${path}`
          ),
        },
      },
    });

    await cloudfrontClient.send(command);
  },

  // Invalidate cache for an event's content
  invalidateEventCache: async (eventId: string): Promise<void> => {
    await cloudfrontOperations.invalidateCache([
      `/events/${eventId}/*`,
      `/uploads/${eventId}/*`,
    ]);
  },

  // Invalidate cache for a specific upload
  invalidateUploadCache: async (
    eventId: string,
    uploadId: string
  ): Promise<void> => {
    await cloudfrontOperations.invalidateCache([
      `/uploads/${eventId}/${uploadId}/*`,
    ]);
  },
};
