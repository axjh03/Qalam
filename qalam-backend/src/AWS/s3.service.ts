import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials not properly configured. Please check your .env file.',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucketName = 'qalam-media-global';
  }

  async generateUploadUrl(
    fileName: string,
    contentType: string,
    userId: string,
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileKey = `uploads/${userId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl,
        fileKey,
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
  }

  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return downloadUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  getPublicUrl(fileKey: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  async getSignedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600 * 24 * 7, // 7 days (maximum allowed by AWS)
      });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
} 