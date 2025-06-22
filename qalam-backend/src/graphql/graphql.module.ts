import { Module } from '@nestjs/common';
import { UserResolver } from './user/user.resolver';
import { PostResolver } from './post/post.resolver';
import { UsersModule } from '../InternalAPI/users/users.module';
import { PostsModule } from '../InternalAPI/posts/posts.module';
import { AuthModule } from '../InternalAPI/auth/auth.module';

@Module({
  imports: [UsersModule, PostsModule, AuthModule],
  providers: [UserResolver, PostResolver],
})
export class GraphQLModule {} 