const { S3Client, PutBucketCorsCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Configuring S3 CORS settings...');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = 'qalam-media-global';

const configureCORS = async () => {
  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:5173', // Vite dev server
          'http://localhost:3000', // Backend
          'http://localhost:3001', // Alternative frontend port
          'https://yourdomain.com', // Add your production domain later
        ],
        ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
        MaxAgeSeconds: 3000,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    console.log('✅ CORS configuration applied successfully!');
    console.log('Allowed origins:', corsConfiguration.CORSRules[0].AllowedOrigins);
    
  } catch (error) {
    console.error('❌ Error configuring CORS:', error.message);
  }
};

configureCORS();

// Add a script to set a public read bucket policy for the uploads/ folder
const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = 'qalam-media-global';

const s3 = new S3Client({ region: REGION });

const publicReadPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'AllowPublicRead',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET}/uploads/*`,
    },
  ],
};

async function setPublicReadPolicy() {
  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify(publicReadPolicy),
      })
    );
    console.log('✅ Public read policy set for uploads/ in', BUCKET);
  } catch (err) {
    console.error('❌ Failed to set bucket policy:', err);
  }
}

if (require.main === module) {
  setPublicReadPolicy();
} 