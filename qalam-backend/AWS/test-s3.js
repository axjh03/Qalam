const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Testing S3 connectivity...');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '***SET***' : 'NOT SET');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const testS3Connection = async () => {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ S3 connection successful!');
    console.log('Available buckets:');
    response.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });
    
    // Check if our bucket exists
    const ourBucket = response.Buckets.find(bucket => bucket.Name === 'qalam-media-global');
    if (ourBucket) {
      console.log('✅ Found qalam-media-global bucket!');
    } else {
      console.log('❌ qalam-media-global bucket not found');
    }
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
  }
};

testS3Connection(); 