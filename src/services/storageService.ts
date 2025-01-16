import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCredentials } from "./auth.service";
import { cloudfrontOperations } from "./cloudfront.service";

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_IMAGES_BUCKET;
const REGION = import.meta.env.VITE_AWS_REGION;

export const uploadImage = async (file: File): Promise<string> => {
  console.log("Uploading image to S3:", {
    fileName: file.name,
    fileSize: file.size,
  });

  try {
    const credentials = await getCredentials();
    const client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    // Generate unique key for the image
    const key = `images/${uuidv4()}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      ""
    )}`;

    // Create command for getting pre-signed URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: file.type,
    });

    // Get pre-signed URL
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log("Got pre-signed URL for upload");

    // Upload file using pre-signed URL
    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("Image uploaded successfully");
    return getImageUrl(key);
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw new Error("Failed to upload image");
  }
};

export const getImageUrl = (key: string): string => {
  if (!key) {
    throw new Error("Image key is required");
  }
  return cloudfrontOperations.getFileUrl(key);
};
