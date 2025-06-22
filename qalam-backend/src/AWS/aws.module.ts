import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBService } from './dynamodb.service';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule],
  providers: [DynamoDBService, S3Service],
  exports: [DynamoDBService, S3Service],
})
export class AWSModule {} 