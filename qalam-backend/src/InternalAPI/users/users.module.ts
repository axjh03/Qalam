import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AWSModule } from '../../AWS/aws.module';

@Module({
  imports: [AWSModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}