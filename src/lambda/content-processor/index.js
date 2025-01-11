/**
 * DropClip Content Processor Lambda Function
 *
 * This Lambda function processes video uploads by:
 * 1. Generating thumbnails
 * 2. Extracting video metadata
 * 3. Creating a web-optimized transcoded version
 *
 * Environment Variables Required:
 * - DYNAMODB_TABLE: DynamoDB table for storing processing status
 * - CONTENT_BUCKET: S3 bucket for processed videos
 * - IMAGES_BUCKET: S3 bucket for thumbnails
 */
const {
  DynamoDBClient,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
} = require("@aws-sdk/client-kms");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createWriteStream } = require("fs");
const { pipeline } = require("stream/promises");

const dynamodb = new DynamoDBClient();
const s3 = new S3Client();
const cloudwatch = new CloudWatchLogsClient();
const kms = new KMSClient();
const TMP_DIR = "/tmp";

// Helper function to download file from S3
async function downloadFromS3(bucket, key) {
  const localPath = path.join(TMP_DIR, path.basename(key));
  const writeStream = createWriteStream(localPath);
  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  await pipeline(response.Body, writeStream);
  return localPath;
}

// Helper function to upload file to S3
async function uploadToS3(bucket, key, localPath, contentType) {
  const fileStream = fs.createReadStream(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    })
  );
}

// Extract video metadata using ffprobe
async function extractMetadata(videoPath) {
  try {
    console.log("Checking ffmpeg binary locations:");

    // Check possible ffmpeg binary locations
    const possiblePaths = ["/opt/ffmpeg/bin", "/opt/bin", "/opt"];

    let ffmpegPath = null;
    for (const basePath of possiblePaths) {
      try {
        console.log(`Checking ${basePath}...`);
        const contents = execSync(`ls -la ${basePath}`).toString();
        console.log(`Contents of ${basePath}:`, contents);
        if (contents.includes("ffmpeg") || contents.includes("ffprobe")) {
          ffmpegPath = basePath;
          break;
        }
      } catch (e) {
        console.log(`Path ${basePath} not accessible:`, e.message);
      }
    }

    if (!ffmpegPath) {
      throw new Error(
        "Could not find ffmpeg binaries in any of the expected locations"
      );
    }

    console.log(`Using ffmpeg binaries from: ${ffmpegPath}`);
    const cmd = `${ffmpegPath}/ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const output = execSync(cmd).toString();
    return JSON.parse(output);
  } catch (error) {
    console.error("Error extracting metadata:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Generate thumbnail at specified timestamp
async function generateThumbnail(videoPath, timestamp = "00:00:01") {
  const thumbnailPath = `${videoPath}_thumb.jpg`;
  try {
    const ffmpegPath = "/opt/bin"; // Use the path we found earlier
    const cmd = `${ffmpegPath}/ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 -f image2 "${thumbnailPath}"`;
    execSync(cmd);
    return thumbnailPath;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
}

// Transcode video to web-optimized format
async function transcodeVideo(videoPath) {
  const transcodedPath = `${videoPath}_transcoded.mp4`;
  try {
    const ffmpegPath = "/opt/bin"; // Use the path we found earlier
    const cmd = `${ffmpegPath}/ffmpeg -i "${videoPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${transcodedPath}"`;
    execSync(cmd);
    return transcodedPath;
  } catch (error) {
    console.error("Error transcoding video:", error);
    throw error;
  }
}

const updateProcessingStatus = async (
  id,
  creativeId,
  status,
  metadata = {}
) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: { S: id },
      creativeId: { S: creativeId },
    },
    UpdateExpression:
      "SET #status = :status, updatedAt = :updatedAt, metadata = :metadata",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": { S: status },
      ":updatedAt": { S: new Date().toISOString() },
      ":metadata": {
        M: Object.entries(metadata).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: { S: String(v) } }),
          {}
        ),
      },
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.send(new UpdateItemCommand(params));
    console.log("Updated processing status:", result);
    return result;
  } catch (error) {
    console.error("Error updating processing status:", error);
    throw error;
  }
};

// Enhanced error tracking
const logError = async (error, context = {}) => {
  console.error("Error occurred:", error);

  const logEvent = {
    timestamp: Date.now(),
    message: JSON.stringify({
      error: error.message,
      stack: error.stack,
      context,
      service: "content-processor",
    }),
  };

  try {
    await cloudwatch.send(
      new PutLogEventsCommand({
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
        logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
        logEvents: [logEvent],
      })
    );
  } catch (cwError) {
    console.error("Failed to log to CloudWatch:", cwError);
  }
};

// KMS encryption helper
const encryptData = async (data) => {
  const command = new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: Buffer.from(JSON.stringify(data)),
  });

  const { CiphertextBlob } = await kms.send(command);
  return CiphertextBlob;
};

// KMS decryption helper
// Note: This function is not used in this Lambda but is kept here as it's paired with encryptData.
// It will be used by other parts of the system that need to read the encrypted metadata
// (e.g., API endpoints that fetch video information).
const decryptData = async (encryptedData) => {
  const command = new DecryptCommand({
    CiphertextBlob: encryptedData,
  });

  const { Plaintext } = await kms.send(command);
  return JSON.parse(Plaintext.toString());
};

// Main video processing function that uses all our helpers
async function processVideo(videoPath) {
  try {
    // Extract metadata first
    const metadata = await extractMetadata(videoPath);

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(videoPath);
    await uploadToS3(
      process.env.IMAGES_BUCKET,
      `thumbnails/${path.basename(videoPath)}.jpg`,
      thumbnailPath,
      "image/jpeg"
    );

    // Transcode video
    const transcodedPath = await transcodeVideo(videoPath);
    await uploadToS3(
      process.env.CONTENT_BUCKET,
      `processed/${path.basename(videoPath)}`,
      transcodedPath,
      "video/mp4"
    );

    return {
      metadata,
      thumbnailPath,
      transcodedPath,
    };
  } catch (error) {
    console.error("Error in video processing:", error);
    throw error;
  }
}

// Enhanced error recovery for video processing
const processVideoWithRecovery = async (videoPath, options = {}) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await processVideo(videoPath);
      return result;
    } catch (error) {
      attempt++;
      await logError(error, {
        attempt,
        videoPath,
        options,
      });

      if (attempt === maxRetries) {
        throw new Error(
          `Failed to process video after ${maxRetries} attempts: ${error.message}`
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
};

exports.handler = async (event) => {
  console.log("Processing event:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      const processingId = uuidv4();
      const creativeId = `upload_${uuidv4()}`;

      try {
        // Download and process video with recovery
        const videoPath = await downloadFromS3(bucket, key);
        const metadata = await extractMetadata(videoPath);

        // Encrypt sensitive metadata
        const encryptedMetadata = await encryptData(metadata);

        // Process video with recovery
        await processVideoWithRecovery(videoPath);

        // Update status with encrypted metadata
        await updateProcessingStatus(processingId, creativeId, "COMPLETED", {
          metadata: encryptedMetadata,
        });
      } catch (processingError) {
        await logError(processingError, {
          bucket,
          key,
          processingId,
          creativeId,
        });

        await updateProcessingStatus(processingId, creativeId, "FAILED", {
          error: processingError.message,
        });
      }
    }

    return {
      statusCode: 200,
      body: "Processing completed",
    };
  } catch (error) {
    await logError(error, { event });

    return {
      statusCode: 500,
      body: "Processing failed",
    };
  }
};
