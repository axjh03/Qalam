/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        imageUrl: { type: 'string', nullable: true },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(@Request() req, @Body() postData: any) {
    try {
      const authorId = req.user.userId;
      const author = await this.usersService.findOne(req.user.username);

      if (!author) {
        throw new Error('User not found');
      }

      const post = await this.postsService.createPost({
        ...postData,
        authorId,
        authorUsername: author.username,
        authorFullName: author.fullName,
        authorAvatarUrl: author.avatarUrl,
      });

      return { message: 'Post created successfully', post };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPosts(@Request() req) {
    try {
      const userId = req.user?.userId;
      const posts = await this.postsService.getAllPosts(userId);
      return { posts };
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiResponse({ status: 200, description: 'User posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPosts(@Request() req) {
    try {
      const authorId = req.user.userId;
      const posts = await this.postsService.getPostsByAuthor(authorId);
      return { posts };
    } catch (error) {
      console.error('Error getting my posts:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':authorId/posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get posts by author ID' })
  @ApiParam({ name: 'authorId', description: 'Author user ID' })
  @ApiResponse({ status: 200, description: 'Author posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPostsByAuthor(@Param('authorId') authorId: string) {
    try {
      const posts = await this.postsService.getPostsByAuthor(authorId);
      return { posts };
    } catch (error) {
      console.error('Error getting posts by author:', error);
      throw error;
    }
  }

  // Comment routes - most specific first
  @UseGuards(JwtAuthGuard)
  @Get(':postId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getComments(@Request() req, @Param('postId') postId: string) {
    try {
      const comments = await this.postsService.getComments(postId);
      return { comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment on a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createComment(
    @Request() req,
    @Param('postId') postId: string,
    @Body() commentData: { content: string },
  ) {
    try {
      const userId = req.user.userId;
      const author = await this.usersService.findOne(req.user.username);

      if (!author) {
        throw new Error('User not found');
      }

      const result = await this.postsService.createComment(
        postId,
        userId,
        author,
        commentData.content,
      );
      return {
        message: 'Comment created successfully',
        comment: result.comment,
        commentsCount: result.commentsCount,
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not comment author' })
  async deleteComment(
    @Request() req,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    try {
      const userId = req.user.userId;
      const result = await this.postsService.deleteComment(
        postId,
        commentId,
        userId,
      );
      return {
        message: 'Comment deleted successfully',
        commentsCount: result.commentsCount,
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Like routes
  @UseGuards(JwtAuthGuard)
  @Get(':postId/like-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get like status for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Like status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLikeStatus(@Request() req, @Param('postId') postId: string) {
    try {
      const userId = req.user.userId;
      const isLiked = await this.postsService.isPostLikedByUser(postId, userId);
      return { isLiked };
    } catch (error) {
      console.error('Error getting like status:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post liked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async likePost(@Request() req, @Param('postId') postId: string) {
    try {
      const userId = req.user.userId;
      const result = await this.postsService.likePost(postId, userId);
      return {
        message: 'Post liked successfully',
        liked: result.liked,
        likesCount: result.likesCount,
      };
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unlikePost(@Request() req, @Param('postId') postId: string) {
    try {
      const userId = req.user.userId;
      const result = await this.postsService.unlikePost(postId, userId);
      return {
        message: 'Post unliked successfully',
        liked: result.liked,
        likesCount: result.likesCount,
      };
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not post author' })
  async deletePost(@Request() req, @Param('postId') postId: string) {
    try {
      const userId = req.user.userId;
      await this.postsService.deletePost(postId, userId);
      return { message: 'Post deleted successfully' };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}
