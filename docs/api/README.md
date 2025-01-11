# DropClip API Documentation

## Overview

The DropClip API provides programmatic access to DropClip's video management and social features. This RESTful API uses JSON for request and response payloads.

## Authentication

### AWS Cognito Authentication
All API requests must include a valid JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token
1. Sign in through Cognito
2. Use the ID token for API requests
3. Token refresh process is handled automatically

## API Endpoints

### Video Management

#### Upload Video
```http
POST /api/videos/upload
Content-Type: multipart/form-data

Parameters:
- file: Video file (required)
- title: String (required)
- description: String (optional)
- privacy: String (public/private, default: private)
```

#### Get Video Details
```http
GET /api/videos/{videoId}

Response:
{
  "id": "string",
  "title": "string",
  "description": "string",
  "url": "string",
  "thumbnailUrl": "string",
  "duration": "number",
  "views": "number",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Update Video
```http
PUT /api/videos/{videoId}
Content-Type: application/json

Body:
{
  "title": "string",
  "description": "string",
  "privacy": "string"
}
```

#### Delete Video
```http
DELETE /api/videos/{videoId}
```

### Playlists

#### Create Playlist
```http
POST /api/playlists
Content-Type: application/json

Body:
{
  "title": "string",
  "description": "string",
  "privacy": "string"
}
```

#### Get Playlist
```http
GET /api/playlists/{playlistId}

Response:
{
  "id": "string",
  "title": "string",
  "description": "string",
  "videos": [
    {
      "id": "string",
      "title": "string",
      "thumbnailUrl": "string"
    }
  ]
}
```

### User Management

#### Get User Profile
```http
GET /api/users/{userId}

Response:
{
  "id": "string",
  "username": "string",
  "email": "string",
  "profilePicture": "string",
  "followers": "number",
  "following": "number"
}
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json

Body:
{
  "username": "string",
  "bio": "string",
  "profilePicture": "string"
}
```

### Social Features

#### Follow User
```http
POST /api/social/follow/{userId}
```

#### Like Video
```http
POST /api/social/videos/{videoId}/like
```

#### Comment on Video
```http
POST /api/social/videos/{videoId}/comments
Content-Type: application/json

Body:
{
  "content": "string"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Rate limit: 100 requests per minute
- Rate limit header: X-RateLimit-Limit
- Remaining requests: X-RateLimit-Remaining
- Reset time: X-RateLimit-Reset

## Pagination

### Request Parameters
```http
GET /api/videos?page=1&limit=10
```

### Response Format
```json
{
  "data": [],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "hasMore": "boolean"
  }
}
```

## Webhooks

### Available Events
- video.uploaded
- video.processed
- video.deleted
- user.followed
- comment.created

### Webhook Payload
```json
{
  "event": "string",
  "timestamp": "string",
  "data": {}
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { DropClipClient } from '@dropclip/sdk';

const client = new DropClipClient({
  token: 'YOUR_JWT_TOKEN'
});

// Upload video
const video = await client.videos.upload({
  file: videoFile,
  title: 'My Video'
});

// Get video details
const details = await client.videos.get(videoId);
```

### Python
```python
from dropclip import DropClipClient

client = DropClipClient(token='YOUR_JWT_TOKEN')

# Upload video
video = client.videos.upload(
    file=video_file,
    title='My Video'
)

# Get video details
details = client.videos.get(video_id)
```

## Best Practices

1. Use appropriate HTTP methods
2. Include error handling
3. Implement rate limiting
4. Cache responses when appropriate
5. Use pagination for large datasets

## Security

1. Always use HTTPS
2. Validate JWT tokens
3. Implement CORS properly
4. Rate limit requests
5. Sanitize inputs

## Support

- API Status: status.dropclip.com
- Developer Forum: forum.dropclip.com
- Email: api-support@dropclip.com
- Documentation: docs.dropclip.com