# AWS DynamoDB Integration Setup

This directory contains the AWS DynamoDB integration for the QalamLink application.

## Prerequisites

1. AWS CLI configured with your credentials
2. AWS credentials with DynamoDB permissions
3. Environment variables set in your `.env` file:
   ```
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   DYNAMODB_TABLE_NAME=Qalam
   ```

## Setting up DynamoDB Table

### Option 1: Using CloudFormation (Recommended)

1. Deploy the CloudFormation template:
   ```bash
   aws cloudformation create-stack \
     --stack-name qalam-dynamodb \
     --template-body file://dynamodb-table.yaml \
     --capabilities CAPABILITY_IAM
   ```

2. Wait for the stack to complete:
   ```bash
   aws cloudformation wait stack-create-complete --stack-name qalam-dynamodb
   ```

### Option 2: Using AWS Console

1. Go to AWS DynamoDB Console
2. Create a new table with the following specifications:
   - **Table name**: `Qalam`
   - **Partition key**: `PK` (String)
   - **Billing mode**: Pay per request

3. Add Global Secondary Indexes:
   - **GSI1**:
     - Partition key: `GSI1PK` (String)
     - Sort key: `GSI1SK` (String)
   - **GSI2**:
     - Partition key: `GSI2PK` (String)
     - Sort key: `GSI2SK` (String)

## Table Schema

The table uses a flexible schema with the following key structure:

- **Primary Key**: `PK` (userId)
- **GSI1**: For username lookups (`USERNAME#username`)
- **GSI2**: For email lookups (`EMAIL#email`)

### User Item Structure

```json
{
  "PK": "user-uuid",
  "userId": "user-uuid",
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "passwordHash": "hashed-password",
  "avatarUrl": "https://...",
  "dateJoined": "2024-01-01T00:00:00Z",
  "postCount": 0,
  "commentCount": 0,
  "followerCount": 0,
  "followingCount": 0,
  "followedUsers": [],
  "followingUsers": [],
  "GSI1PK": "USERNAME#johndoe",
  "GSI1SK": "2024-01-01T00:00:00Z",
  "GSI2PK": "EMAIL#john@example.com",
  "GSI2SK": "2024-01-01T00:00:00Z"
}
```

## Testing the Integration

1. Start your backend server:
   ```bash
   npm run start:dev
   ```

2. Test signup via the frontend or using curl:
   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "fullName": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. Test login:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=password123"
   ```

## Troubleshooting

- **401 Unauthorized**: Check if the user exists and password is correct
- **500 Internal Server Error**: Check AWS credentials and table permissions
- **Table not found**: Ensure the DynamoDB table is created in the correct region

## Next Steps

- Add more entities (Posts, Comments, Likes, Reposts)
- Implement pagination for queries
- Add caching layer (Redis/ElastiCache)
- Set up CloudWatch monitoring 