import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from '../../InternalAPI/posts/posts.service';
import { UsersService } from '../../InternalAPI/users/users.service';
import { JwtAuthGuard } from '../../InternalAPI/auth/jwt-auth.guard';
import { 
  Post, 
  PostsResponse, 
  PostResponse, 
  Comment, 
  CommentsResponse, 
  CommentResponse,
  LikeResponse 
} from './post.model';
import { CreatePostInput, CreateCommentInput } from './post.input';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => PostsResponse)
  @UseGuards(JwtAuthGuard)
  async getAllPosts(@Context() context: any) {
    const userId = context.req.user?.userId;
    const posts = await this.postsService.getAllPosts(userId);
    return { posts };
  }

  @Query(() => PostsResponse)
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@Context() context: any) {
    const authorId = context.req.user.userId;
    const posts = await this.postsService.getPostsByAuthor(authorId);
    return { posts };
  }

  @Query(() => PostsResponse)
  @UseGuards(JwtAuthGuard)
  async getPostsByAuthor(@Args('authorId') authorId: string) {
    const posts = await this.postsService.getPostsByAuthor(authorId);
    return { posts };
  }

  @Query(() => CommentsResponse)
  @UseGuards(JwtAuthGuard)
  async getComments(@Args('postId') postId: string) {
    const comments = await this.postsService.getComments(postId);
    return { comments };
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Context() context: any,
    @Args('postId') postId: string,
  ) {
    const userId = context.req.user.userId;
    return await this.postsService.isPostLikedByUser(postId, userId);
  }

  @Mutation(() => PostResponse)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Context() context: any,
    @Args('input') input: CreatePostInput,
  ) {
    const authorId = context.req.user.userId;
    const author = await this.usersService.findOne(context.req.user.username);

    if (!author) {
      throw new Error('User not found');
    }

    const post = await this.postsService.createPost({
      authorId,
      authorUsername: author.username,
      authorFullName: author.fullName,
      authorAvatarUrl: author.avatarUrl,
      title: input.title,
      subtitle: input.subtitle,
      contentStructure: input.contentStructure,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
    });

    return { message: 'Post created successfully', post };
  }

  @Mutation(() => CommentResponse)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Context() context: any,
    @Args('postId') postId: string,
    @Args('input') input: CreateCommentInput,
  ) {
    const userId = context.req.user.userId;
    const author = await this.usersService.findOne(context.req.user.username);

    if (!author) {
      throw new Error('User not found');
    }

    const result = await this.postsService.createComment(
      postId,
      userId,
      author,
      input.content,
    );

    return {
      message: 'Comment created successfully',
      comment: result.comment,
      commentsCount: result.commentsCount,
    };
  }

  @Mutation(() => LikeResponse)
  @UseGuards(JwtAuthGuard)
  async likePost(
    @Context() context: any,
    @Args('postId') postId: string,
  ) {
    const userId = context.req.user.userId;
    const result = await this.postsService.likePost(postId, userId);
    
    return {
      message: 'Post liked successfully',
      liked: result.liked,
      likesCount: result.likesCount,
    };
  }

  @Mutation(() => LikeResponse)
  @UseGuards(JwtAuthGuard)
  async unlikePost(
    @Context() context: any,
    @Args('postId') postId: string,
  ) {
    const userId = context.req.user.userId;
    const result = await this.postsService.unlikePost(postId, userId);
    
    return {
      message: 'Post unliked successfully',
      liked: result.liked,
      likesCount: result.likesCount,
    };
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Context() context: any,
    @Args('postId') postId: string,
  ) {
    const userId = context.req.user.userId;
    await this.postsService.deletePost(postId, userId);
    return 'Post deleted successfully';
  }

  @Mutation(() => CommentResponse)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Context() context: any,
    @Args('postId') postId: string,
    @Args('commentId') commentId: string,
  ) {
    const userId = context.req.user.userId;
    const result = await this.postsService.deleteComment(
      postId,
      commentId,
      userId,
    );
    
    return {
      message: 'Comment deleted successfully',
      comment: null,
      commentsCount: result.commentsCount,
    };
  }
} 