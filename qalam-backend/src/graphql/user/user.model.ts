import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  userId: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  postCount: number;

  @Field()
  likesCount: number;

  @Field()
  commentCount: number;

  @Field()
  followerCount: number;

  @Field()
  dateJoined: string;
}

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  userId: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  postCount: number;

  @Field()
  likesCount: number;

  @Field()
  commentCount: number;

  @Field()
  followerCount: number;

  @Field()
  dateJoined: string;

  @Field()
  email: string;
} 