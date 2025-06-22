import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field(() => ID)
  commentId: string;

  @Field()
  postId: string;

  @Field()
  content: string;

  @Field()
  authorId: string;

  @Field()
  authorUsername: string;

  @Field()
  authorFullName: string;

  @Field({ nullable: true })
  authorAvatarUrl?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class Post {
  @Field(() => ID)
  postId: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  authorId: string;

  @Field()
  authorUsername: string;

  @Field()
  authorFullName: string;

  @Field({ nullable: true })
  authorAvatarUrl?: string;

  @Field()
  likesCount: number;

  @Field()
  commentsCount: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field()
  isLiked: boolean;
}

@ObjectType()
export class PostResponse {
  @Field()
  message: string;

  @Field(() => Post)
  post: Post;
}

@ObjectType()
export class PostsResponse {
  @Field(() => [Post])
  posts: Post[];
}

@ObjectType()
export class CommentResponse {
  @Field()
  message: string;

  @Field(() => Comment)
  comment: Comment;

  @Field()
  commentsCount: number;
}

@ObjectType()
export class CommentsResponse {
  @Field(() => [Comment])
  comments: Comment[];
}

@ObjectType()
export class LikeResponse {
  @Field()
  message: string;

  @Field()
  liked: boolean;

  @Field()
  likesCount: number;
} 