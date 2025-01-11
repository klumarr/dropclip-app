const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const fs = require("fs");
const path = require("path");

const s3 = new S3Client({ region: "eu-north-1" });
const ddb = new DynamoDBClient({ region: "eu-north-1" });

const updateProcessingStatus = async (id, status, details = {}) => {
    console.log(`Updating processing status to ${status}`, details);
    await ddb.send(new UpdateItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { id: { S: id } },
        UpdateExpression: "SET #status = :status, details = :details, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
            ":status": { S: status },
            ":details": { S: JSON.stringify(details) },
            ":updatedAt": { S: new Date().toISOString() }
        }
    }));
};

const processVideo = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .size("720x?")
            .autopad()
            .format("mp4")
            .on("progress", progress => console.log(`Processing: ${progress.percent}% done`))
            .on("end", () => resolve(outputPath))
            .on("error", reject)
            .save(outputPath);
    });
};

const generateThumbnail = async (inputPath) => {
    return new Promise((resolve, reject) => {
        const thumbnailPath = "/tmp/thumbnail.jpg";
        ffmpeg(inputPath)
            .screenshots({
                timestamps: ["00:00:01"],
                filename: "thumbnail.jpg",
                folder: "/tmp"
            })
            .on("end", () => resolve(thumbnailPath))
            .on("error", reject);
    });
};

exports.handler = async (event) => {
    console.log("Processing event:", JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            const bucketName = record.s3.bucket.name;
            const key = record.s3.object.key;
            const processingId = `processing_${Date.now()}_${key.replace(/[^a-zA-Z0-9]/g, "_")}`;
            
            await updateProcessingStatus(processingId, "STARTED");
            
            // Download video
            const inputPath = `/tmp/${path.basename(key)}`;
            const outputPath = `/tmp/processed_${path.basename(key)}`;
            
            console.log("Downloading video...");
            const getObjectResponse = await s3.send(new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            }));
            
            await new Promise((resolve, reject) => {
                getObjectResponse.Body
                    .pipe(fs.createWriteStream(inputPath))
                    .on("finish", resolve)
                    .on("error", reject);
            });
            
            // Generate thumbnail
            console.log("Generating thumbnail...");
            await updateProcessingStatus(processingId, "GENERATING_THUMBNAIL");
            const thumbnailPath = await generateThumbnail(inputPath);
            
            // Process video
            console.log("Processing video...");
            await updateProcessingStatus(processingId, "PROCESSING_VIDEO");
            await processVideo(inputPath, outputPath);
            
            // Upload results
            console.log("Uploading results...");
            await updateProcessingStatus(processingId, "UPLOADING");
            
            // Upload thumbnail
            await s3.send(new PutObjectCommand({
                Bucket: process.env.IMAGES_BUCKET,
                Key: `thumbnails/${path.basename(key, path.extname(key))}.jpg`,
                Body: fs.createReadStream(thumbnailPath),
                ContentType: "image/jpeg"
            }));
            
            // Upload processed video
            await s3.send(new PutObjectCommand({
                Bucket: process.env.CONTENT_BUCKET,
                Key: `videos/${path.basename(key)}`,
                Body: fs.createReadStream(outputPath),
                ContentType: "video/mp4"
            }));
            
            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            fs.unlinkSync(thumbnailPath);
            
            await updateProcessingStatus(processingId, "COMPLETED", {
                thumbnailKey: `thumbnails/${path.basename(key, path.extname(key))}.jpg`,
                videoKey: `videos/${path.basename(key)}`
            });
        }
        
        return { statusCode: 200, body: "Processing completed successfully" };
    } catch (error) {
        console.error("Processing failed:", error);
        return { statusCode: 500, body: error.message };
    }
};
