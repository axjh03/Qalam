import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AWSModule } from '../../AWS/aws.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AWSModule, UsersModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {} 