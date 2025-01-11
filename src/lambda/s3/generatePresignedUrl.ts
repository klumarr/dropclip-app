import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCorsHeaders } from "../utils/cors";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
});

export const handler = async (event) => {
  try {
    const { key, contentType, bucket } = JSON.parse(event.body);

    if (!key || !contentType || !bucket) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event.headers?.origin),
        body: JSON.stringify({
          message: "Missing required parameters",
        }),
      };
    }

    // Generate pre-signed URL for upload
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Generate the public URL
    const publicUrl = `https://${bucket}.s3.${
      process.env.AWS_REGION || "eu-north-1"
    }.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers: getCorsHeaders(event.headers?.origin),
      body: JSON.stringify({
        presignedUrl,
        publicUrl,
      }),
    };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(event.headers?.origin),
      body: JSON.stringify({
        message: "Error generating pre-signed URL",
        error: error.message,
      }),
    };
  }
};
