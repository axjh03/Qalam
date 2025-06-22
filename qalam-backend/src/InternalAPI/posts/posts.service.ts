import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../../AWS/dynamodb.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly usersService: UsersService,
  ) {}

  async createPost(postData: {
    authorId: string;
    authorUsername: string;
    authorFullName: string;
    authorAvatarUrl?: string;
    title: string;
    subtitle: string;
    contentStructure: string;
    mediaUrl?: string;
    mediaType?: string;
  }) {
    try {
      const postId = Date.now() + Math.floor(Math.random() * 1000); // Numeric ID
      const timestamp = new Date().toISOString();

      const post = {
        userID: postId, // Numeric primary key for the table
        postId: postId.toString(), // String version for reference
        authorId: postData.authorId,
        authorUsername: postData.authorUsername,
        authorFullName: postData.authorFullName,
        authorAvatarUrl: postData.authorAvatarUrl || '',
        title: postData.title,
        subtitle: postData.subtitle,
        contentStructure: postData.contentStructure,
        mediaUrl: postData.mediaUrl || '',
        mediaType: postData.mediaType || 'none',
        thumbnailUrl: '',
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        tags: [],
        minReadTime: this.calculateReadTime(postData.contentStructure),
        createdAt: timestamp,
        updatedAt: timestamp,
        isPublished: true,
        GSI1PK: `AUTHOR#${postData.authorId}`,
        GSI1SK: timestamp,
        GSI2PK: 'ALL_POSTS',
        GSI2SK: timestamp,
      };

      await this.dynamoDBService.createPost(post);
      console.log('Post created successfully:', postId);
      this.usersService.incrementPostCount(postData.authorId);
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPostsByAuthor(authorId: string) {
    try {
      return await this.dynamoDBService.getPostsByAuthor(authorId);
    } catch (error) {
      console.error('Error getting posts by author:', error);
      return [];
    }
  }

  async getAllPosts(userIdToExclude?: string) {
    try {
      const allPosts = await this.dynamoDBService.getAllPosts();
      if (userIdToExclude) {
        return allPosts.filter(post => post.authorId !== userIdToExclude);
      }
      return allPosts;
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }

  async likePost(postId: string, userId: string) {
    try {
      const result = await this.dynamoDBService.likePost(postId, userId);
      // If the post was newly liked, increment user's like count
      if (result.liked) {
        await this.usersService.incrementLikesCount(userId);
      }
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string) {
    try {
      const result = await this.dynamoDBService.unlikePost(postId, userId);
      // If the post was unliked, decrement user's like count
      if (!result.liked) {
        await this.usersService.decrementLikesCount(userId);
      }
      return result;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async isPostLikedByUser(postId: string, userId: string) {
    try {
      return await this.dynamoDBService.isPostLikedByUser(postId, userId);
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.dynamoDBService.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('You are not authorized to delete this post');
    }

    await this.dynamoDBService.deletePost(postId);
    // Do not await, let it run in background
    this.usersService.decrementPostCount(userId);
  }

  async createComment(postId: string, userId: string, author: any, content: string) {
    try {
      const result = await this.dynamoDBService.createComment(postId, userId, author, content);
      // Increment user's comment count
      await this.usersService.incrementCommentsCount(userId);
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    try {
      return await this.dynamoDBService.getComments(postId);
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async deleteComment(postId: string, commentId: string, userId: string) {
    try {
      const result = await this.dynamoDBService.deleteComment(postId, commentId, userId);
      // Decrement user's comment count
      await this.usersService.decrementCommentsCount(userId);
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  private calculateReadTime(content: string): number {
    // Simple calculation: ~200 words per minute
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }
} 