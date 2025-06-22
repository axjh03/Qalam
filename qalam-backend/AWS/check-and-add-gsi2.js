const { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tableName = process.env.DYNAMODB_TABLE_NAME || 'Qalam';

const checkAndAddGSI2 = async () => {
  try {
    // Check table status
    console.log('Checking table status...');
    const describeCommand = new DescribeTableCommand({
      TableName: tableName,
    });
    
    const tableInfo = await client.send(describeCommand);
    console.log('Table status:', tableInfo.Table.TableStatus);
    
    // Check GSI1 status
    const gsi1 = tableInfo.Table.GlobalSecondaryIndexes?.find(index => index.IndexName === 'GSI1');
    if (gsi1) {
      console.log('GSI1 status:', gsi1.IndexStatus);
      
      if (gsi1.IndexStatus === 'ACTIVE') {
        console.log('✅ GSI1 is active! Adding GSI2...');
        
        // Add GSI2
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
        console.log('✅ GSI2 index creation started!');
        console.log('Please wait a few minutes for GSI2 to become active.');
        
      } else {
        console.log('⏳ GSI1 is still being created. Status:', gsi1.IndexStatus);
        console.log('Please wait and run this script again in a few minutes.');
      }
    } else {
      console.log('❌ GSI1 not found. Please run add-indexes.js first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkAndAddGSI2(); 