const env = {
  aws: {
    region: import.meta.env.VITE_AWS_REGION || "eu-north-1",
    s3Bucket: import.meta.env.VITE_AWS_S3_BUCKET_NAME || "dropclip-content",
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
  },
};

export default env;
