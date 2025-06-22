const { DynamoDBClient, UpdateTableCommand } = require('@aws-sdk/client-dynamodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Adding missing indexes to DynamoDB table...');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '***SET***' : 'NOT SET');
console.log('DYNAMODB_TABLE_NAME:', process.env.DYNAMODB_TABLE_NAME);

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tableName = process.env.DYNAMODB_TABLE_NAME || 'Qalam';

const addIndexes = async () => {
  try {
    // Add GSI1 (for username lookups)
    console.log('Adding GSI1 index...');
    const gsi1Command = new UpdateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'GSI1PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'GSI1SK',
          AttributeType: 'S',
        },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'GSI1',
            KeySchema: [
              {
                AttributeName: 'GSI1PK',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'GSI1SK',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        },
      ],
    });

    await client.send(gsi1Command);
    console.log('✅ GSI1 index created successfully!');

    // Wait a bit before adding the second index
    console.log('Waiting 30 seconds before adding GSI2...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Add GSI2 (for email lookups)
    console.log('Adding GSI2 index...');
    const gsi2Command = new UpdateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'GSI2PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'GSI2SK',
          AttributeType: 'S',
        },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'GSI2',
            KeySchema: [
              {
                AttributeName: 'GSI2PK',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'GSI2SK',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        },
      ],
    });

    await client.send(gsi2Command);
    console.log('✅ GSI2 index created successfully!');
    console.log('🎉 All indexes added successfully!');

  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Index is already being created or table is being updated. Please wait and try again.');
    } else if (error.name === 'ValidationException' && error.message.includes('already exists')) {
      console.log('Index already exists, skipping...');
    } else {
      console.error('❌ Error adding indexes:', error.message);
    }
  }
};

addIndexes(); 