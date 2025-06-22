import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './InternalAPI/auth/auth.module';
import { UsersModule } from './InternalAPI/users/users.module';
import { PostsModule } from './InternalAPI/posts/posts.module';
import { AWSModule } from './AWS/aws.module';
import { GraphQLModule as CustomGraphQLModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Automatically generate schema
      playground: true, // Enable GraphQL playground
      introspection: true, // Enable introspection for tools
      context: ({ req }) => ({ req }), // Pass request to context
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    AWSModule,
    CustomGraphQLModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
