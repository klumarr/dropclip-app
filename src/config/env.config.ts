const env = {
  aws: {
    region: import.meta.env.VITE_AWS_REGION || "eu-north-1",
    s3Bucket: import.meta.env.VITE_AWS_S3_BUCKET || "dropclip-content-dev",
    s3UploadsBucket:
      import.meta.env.VITE_AWS_S3_UPLOADS_BUCKET || "dropclip-uploads-dev",
    s3ImagesBucket:
      import.meta.env.VITE_AWS_S3_IMAGES_BUCKET || "dropclip-images-dev",
  },
  api: {
    endpoint:
      import.meta.env.VITE_API_ENDPOINT ||
      "https://4t6y6pteaa.execute-api.eu-north-1.amazonaws.com/dev",
  },
};

// Add debug logging
console.log("Environment Configuration:", {
  region: env.aws.region,
  buckets: {
    content: env.aws.s3Bucket,
    uploads: env.aws.s3UploadsBucket,
    images: env.aws.s3ImagesBucket,
  },
  api: {
    endpoint: env.api.endpoint,
  },
});

export default env;
