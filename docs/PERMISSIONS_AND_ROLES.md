## Update: January 7, 2025

### Role Structure Updates

#### 1. Creative Role Enhancements

- **Collection Management**
  ```json
  {
    "Effect": "Allow",
    "Action": ["execute-api:Invoke"],
    "Resource": [
      "arn:aws:execute-api:${region}:${account}:${apiId}/*/collections/*"
    ]
  }
  ```
  - Collection creation and management
  - Content moderation capabilities
  - Fan submission approval
  - Analytics access

#### 2. Fan Role Updates

- **Playlist Management**
  ```json
  {
    "Effect": "Allow",
    "Action": ["execute-api:Invoke"],
    "Resource": [
      "arn:aws:execute-api:${region}:${account}:${apiId}/*/playlists/*"
    ]
  }
  ```
  - Playlist creation and management
  - Content sharing permissions
  - Cross-creator content access
  - Social features

### Planned Permission Changes

#### 1. API Gateway Migration

- Moving from direct DynamoDB access to API Gateway
- Implementing WebSocket permissions
- Restricting database access
- Enhancing security controls

#### 2. WebSocket Permissions

```json
{
  "Effect": "Allow",
  "Action": ["execute-api:ManageConnections"],
  "Resource": [
    "arn:aws:execute-api:${region}:${account}:${apiId}/${stage}//@connections/*"
  ]
}
```

#### 3. Service Role Updates

- **Lambda Execution Roles**
  - API Gateway invocation
  - DynamoDB access through Lambda
  - S3 operations
  - WebSocket management

### Implementation Timeline

1. **Phase 1: Role Audit**

   - Document current permissions
   - Identify security gaps
   - Plan migration strategy
   - Create role templates

2. **Phase 2: Implementation**

   - Deploy new IAM roles
   - Update service permissions
   - Implement API Gateway auth
   - Configure WebSocket security

3. **Phase 3: Validation**
   - Test new permissions
   - Verify access patterns
   - Monitor security logs
   - Document changes
