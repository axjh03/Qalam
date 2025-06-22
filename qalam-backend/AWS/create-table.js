const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Environment variables:');
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

const createTable = async () => {
  const params = {
    TableName: tableName,
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH',
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI1PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI1SK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI2PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI2SK',
        AttributeType: 'S',
      },
    ],
    GlobalSecondaryIndexes: [
      {
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
      {
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
    ],
    BillingMode: 'PAY_PER_REQUEST',
  };

  try {
    const command = new CreateTableCommand(params);
    const result = await client.send(command);
    console.log('Table created successfully:', result);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      console.error('Error creating table:', error);
    }
  }
};

createTable(); 