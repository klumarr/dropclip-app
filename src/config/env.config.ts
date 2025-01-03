const env = {
  aws: {
    region: import.meta.env.VITE_AWS_REGION || "eu-north-1",
    s3Bucket: import.meta.env.VITE_S3_BUCKET || "dropclip-content",
  },
};

export default env;
