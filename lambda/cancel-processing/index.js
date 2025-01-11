const {
  DynamoDBClient,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const dynamodb = new DynamoDBClient();
const s3 = new S3Client();

const updateProcessingStatus = async (uploadId, status) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: { S: uploadId },
    },
    UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": { S: status },
      ":updatedAt": { S: new Date().toISOString() },
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

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { uploadId, bucket, key } = body;

    if (!uploadId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing uploadId in request body",
        }),
      };
    }

    // 1. Update the processing status to CANCELLED
    await updateProcessingStatus(uploadId, "CANCELLED");

    // 2. If bucket and key are provided, try to delete any in-progress processing artifacts
    if (bucket && key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        );
        console.log(`Deleted processing artifact: ${bucket}/${key}`);
      } catch (s3Error) {
        console.warn("Warning: Could not delete processing artifact:", s3Error);
        // Don't fail the whole operation if artifact deletion fails
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Video processing cancellation successful",
        uploadId: uploadId,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to cancel video processing",
        error: error.message,
      }),
    };
  }
};
