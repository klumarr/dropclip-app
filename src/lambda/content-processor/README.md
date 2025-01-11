# DropClip Content Processor Lambda Function

This Lambda function processes video uploads for the DropClip application. It performs the following tasks:

1. Generates thumbnails from videos
2. Extracts video metadata using ffprobe
3. Creates web-optimized versions of videos using ffmpeg

## Requirements

- Node.js 18.x
- AWS Lambda Layers:
  - ffmpeg layer (ARN: arn:aws:lambda:eu-north-1:175033217214:layer:ffmpeg:1)
  - video-utils layer (your custom layer)

## Environment Variables

The following environment variables must be set:

- `DYNAMODB_TABLE`: DynamoDB table for storing processing status
- `CONTENT_BUCKET`: S3 bucket for processed videos
- `IMAGES_BUCKET`: S3 bucket for thumbnails
- `UPLOADS_BUCKET`: S3 bucket for original uploads

## Deployment

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a deployment package:

   ```bash
   zip -r function.zip index.js node_modules/
   ```

3. Upload to AWS Lambda through the console or CLI

## Testing

You can test the function by uploading a video file to the configured S3 bucket. The function will automatically:

1. Create a thumbnail in the IMAGES_BUCKET
2. Create a web-optimized version in the CONTENT_BUCKET
3. Update the processing status in DynamoDB

## Monitoring

The function logs all operations to CloudWatch Logs. You can monitor:

- Processing status
- Metadata extraction
- Thumbnail generation
- Video transcoding
- Error messages

## Error Handling

The function handles errors by:

1. Logging detailed error messages to CloudWatch
2. Updating the DynamoDB record with FAILED status
3. Including error details in the metadata
4. Cleaning up any temporary files
