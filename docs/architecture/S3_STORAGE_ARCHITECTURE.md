# S3 Storage Architecture

## Bucket Organization

### 1. dropclip-uploads-dev

- **Purpose**: Temporary staging bucket for initial uploads
- **Access**: Write access through pre-signed URLs
- **Lifecycle**: Files are processed and moved to appropriate destination buckets
- **Use Cases**: Initial upload point for all video content requiring processing

### 2. dropclip-content-dev

- **Purpose**: Main content distribution bucket
- **Access**: Read-only through CloudFront
- **Integration**: Connected to CloudFront for content delivery
- **Use Cases**: Processed videos and their associated metadata

### 3. dropclip-images-dev

- **Purpose**: Image storage and distribution
- **Access**: Write via pre-signed URLs, read via CloudFront
- **Use Cases**: Event flyers, profile pictures, supplementary images

## Content Flow Diagrams

### Video Upload Flow (Fans & Creatives)

```
User → API Gateway → S3 (dropclip-uploads-dev)
                  → Lambda (content-processor)
                  → S3 (dropclip-content-dev)
                  → CloudFront (for distribution)
```

**Process Details**:

1. User receives pre-signed URL for upload
2. Content uploaded to dropclip-uploads-dev
3. Lambda trigger processes video:
   - Generates thumbnails
   - Transcodes video if needed
   - Moves processed content to dropclip-content-dev
4. CloudFront serves the processed content

### Event Flyer Images (Creatives)

```
Creative → API Gateway → S3 (dropclip-images-dev)
                      → CloudFront (for distribution)
```

**Process Details**:

1. Creative uploads flyer through event creation
2. Direct upload to dropclip-images-dev
3. No processing required
4. CloudFront serves images for event displays

### Fan Event Content Upload

```
Fan → Event Page → Upload Form
     → API Gateway
     → S3 (dropclip-uploads-dev)
        - Video files → Lambda processing → dropclip-content-dev
        - Image files → dropclip-images-dev
     → DynamoDB (links content to event)
     → CloudFront (for distribution)
```

**Process Details**:

1. Fan uploads content from event page
2. Content is split based on type:
   - Videos go through processing pipeline
   - Images go directly to dropclip-images-dev
3. All content is associated with:
   - Event ID
   - Fan ID (uploader)
   - Creative ID (performer)
4. Content paths follow structure:
   ```
   events/{eventId}/uploads/{fanId}/{uploadId}/
     - video.mp4
     - images/
       - image1.jpg
       - image2.jpg
   ```

## DynamoDB Integration

### Tables Used:

- `dev-uploads`: Tracks all uploaded content
- `dev-events`: Links uploads to specific events
- `dropclip-collections-dev`: Organizes content into collections

### Content Association:

```json
{
  "uploadId": "uuid",
  "eventId": "event-uuid",
  "fanId": "user-uuid",
  "creativeId": "creative-uuid",
  "contentType": "video|image",
  "status": "processing|complete",
  "urls": {
    "content": "cloudfront-url",
    "thumbnail": "cloudfront-url"
  }
}
```

## Security & Access Control

### IAM Roles:

- **Creative Role**:
  - Full access to own event content
  - Read access to fan uploads for their events
- **Fan Role**:
  - Upload access to specific event directories
  - Read access to public content

### CloudFront Distribution:

- Serves all content through HTTPS
- Uses Origin Access Identity for S3 access
- Implements proper CORS headers
- Caches content at edge locations

### URL Generation:

- Upload URLs: Pre-signed S3 URLs with short expiration
- View URLs: CloudFront URLs with proper path structure
- Thumbnail URLs: CloudFront URLs for processed thumbnails

## Best Practices

1. **Upload Management**:

   - Always use pre-signed URLs for uploads
   - Implement proper error handling
   - Include progress tracking
   - Validate file types and sizes

2. **Content Distribution**:

   - Always serve through CloudFront
   - Use appropriate cache settings
   - Implement proper CORS headers
   - Handle invalidation when content updates

3. **Security**:

   - Implement proper bucket policies
   - Use least privilege access
   - Regular security audits
   - Monitor access patterns

4. **Performance**:
   - Enable compression where appropriate
   - Use multi-part uploads for large files
   - Implement proper retry logic
   - Monitor CloudFront metrics
