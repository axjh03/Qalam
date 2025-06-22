const { DynamoDBClient, DescribeTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Checking DynamoDB table schema...');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tableName = process.env.DYNAMODB_TABLE_NAME || 'Qalam';

const checkTableSchema = async () => {
  try {
    // Check table structure
    console.log('1. Table structure:');
    const describeCommand = new DescribeTableCommand({
      TableName: tableName,
    });
    
    const tableInfo = await client.send(describeCommand);
    console.log('Primary Key:', tableInfo.Table.KeySchema);
    console.log('Attribute Definitions:', tableInfo.Table.AttributeDefinitions);
    console.log('GSIs:', tableInfo.Table.GlobalSecondaryIndexes?.map(gsi => gsi.IndexName) || 'None');
    
    // Check if there are any existing items
    console.log('\n2. Checking existing items...');
    const scanCommand = new ScanCommand({
      TableName: tableName,
      Limit: 5,
    });
    
    const scanResult = await client.send(scanCommand);
    console.log('Items found:', scanResult.Items?.length || 0);
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      console.log('Sample item structure:');
      console.log(JSON.stringify(scanResult.Items[0], null, 2));
    } else {
      console.log('No items found in table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkTableSchema(); 