import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoDBService {
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials not properly configured. Please check your .env file.',
      );
    }

    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.dynamoClient = DynamoDBDocumentClient.from(client);
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_NAME') || 'Qalam';
  }

  async createUser(userData: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    avatarUrl?: string;
    githubId?: string;
    googleId?: string;
  }) {
    const timestamp = new Date().toISOString();

    const numericUserId = Date.now() + Math.floor(Math.random() * 1000);

    const user = {
      userID: numericUserId,
      userId: numericUserId.toString(),
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: userData.password,
      avatarUrl: userData.avatarUrl || '',
      githubId: userData.githubId || '',
      googleId: userData.googleId || '',
      dateJoined: timestamp,
      postCount: 0,
      commentCount: 0,
      likesCount: 0,
      followerCount: 0,
      followingCount: 0,
      followedUsers: [],
      followingUsers: [],
      GSI1PK: `USERNAME#${userData.username}`,
      GSI1SK: timestamp,
      GSI2PK: `EMAIL#${userData.email}`,
      GSI2SK: timestamp,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userID)',
    });

    try {
      await this.dynamoClient.send(command);
      console.log('User created successfully:', userData.username);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :username',
        ExpressionAttributeValues: {
          ':username': `USERNAME#${username}`,
        },
      });

      const response = await this.dynamoClient.send(command);
      return response.Items?.[0] || null;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (
        err.name === 'ValidationException' &&
        err.message?.includes('does not have the specified index')
      ) {
        console.log('GSI1 index not ready yet, falling back to scan...');
        // Fallback: scan the table (not efficient but works for testing)
        return await this.scanForUserByUsername(username);
      }
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :email',
        ExpressionAttributeValues: {
          ':email': `EMAIL#${email}`,
        },
      });

      const response = await this.dynamoClient.send(command);
      return response.Items?.[0] || null;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (
        err.name === 'ValidationException' &&
        err.message?.includes('does not have the specified index')
      ) {
        console.log('GSI2 index not ready yet, falling back to scan...');
        // Fallback: scan the table (not efficient but works for testing)
        return await this.scanForUserByEmail(email);
      }
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    // Try to convert to number first, then fallback to string
    const numericUserId = parseInt(userId, 10);
    
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        userID: isNaN(numericUserId) ? userId : numericUserId,
      },
    });

    try {
      const response = await this.dynamoClient.send(command);
      return response.Item || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getAllUsers() {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'attribute_exists(username)', // Only get users with usernames
    });

    try {
      const response = await this.dynamoClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Fallback methods for when indexes are not ready
  private async scanForUserByUsername(username: string) {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    });

    const response = await this.dynamoClient.send(command);
    return response.Items?.[0] || null;
  }

  private async scanForUserByEmail(email: string) {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });

    const response = await this.dynamoClient.send(command);
    return response.Items?.[0] || null;
  }

  // Posts methods
  async createPost(post: Record<string, unknown>) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: post,
      ConditionExpression: 'attribute_not_exists(postId)',
    });

    try {
      await this.dynamoClient.send(command);
      console.log(
        'Post created successfully:',
        (post as { postId: string }).postId,
      );
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPostsByAuthor(authorId: string) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :authorId',
        ExpressionAttributeValues: {
          ':authorId': `AUTHOR#${authorId}`,
        },
        ScanIndexForward: false, // Newest first
      });

      const response = await this.dynamoClient.send(command);
      return response.Items || [];
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (
        err.name === 'ValidationException' &&
        err.message?.includes('does not have the specified index')
      ) {
        console.log('GSI1 index not ready yet, falling back to scan...');
        return await this.scanForPostsByAuthor(authorId);
      }
      console.error('Error getting posts by author:', error);
      throw error;
    }
  }

  async getAllPosts() {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :allPosts',
        ExpressionAttributeValues: {
          ':allPosts': 'ALL_POSTS',
        },
        ScanIndexForward: false, // Newest first
      });

      const response = await this.dynamoClient.send(command);
      return response.Items || [];
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (
        err.name === 'ValidationException' &&
        err.message?.includes('does not have the specified index')
      ) {
        console.log('GSI2 index not ready yet, falling back to scan...');
        return await this.scanForAllPosts();
      }
      console.error('Error getting all posts:', error);
      throw error;
    }
  }

  // Fallback methods for posts
  private async scanForPostsByAuthor(authorId: string) {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'authorId = :authorId',
      ExpressionAttributeValues: {
        ':authorId': authorId,
      },
    });

    const response = await this.dynamoClient.send(command);
    return response.Items || [];
  }

  private async scanForAllPosts() {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'attribute_exists(postId)',
    });

    const response = await this.dynamoClient.send(command);
    return response.Items || [];
  }

  // Like methods
  async likePost(postId: string, userId: string) {
    try {
      // First, get the current post
      const post = await this.getPostById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user already liked the post
      const likedBy = post.likedBy || [];
      if (likedBy.includes(userId)) {
        return { liked: true, likesCount: post.likesCount || 0 };
      }

      // Add user to likedBy array and increment likesCount
      const updatedLikedBy = [...likedBy, userId];
      const newLikesCount = (post.likesCount || 0) + 1;

      // Update the post
      const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: post.userID },
        UpdateExpression: 'SET likedBy = :likedBy, likesCount = :likesCount',
        ExpressionAttributeValues: {
          ':likedBy': updatedLikedBy,
          ':likesCount': newLikesCount,
        },
      });

      await this.dynamoClient.send(command);
      return { liked: true, likesCount: newLikesCount };
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string) {
    try {
      // First, get the current post
      const post = await this.getPostById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user liked the post
      const likedBy = post.likedBy || [];
      if (!likedBy.includes(userId)) {
        return { liked: false, likesCount: post.likesCount || 0 };
      }

      // Remove user from likedBy array and decrement likesCount
      const updatedLikedBy = likedBy.filter(id => id !== userId);
      const newLikesCount = Math.max(0, (post.likesCount || 0) - 1);

      // Update the post
      const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: post.userID },
        UpdateExpression: 'SET likedBy = :likedBy, likesCount = :likesCount',
        ExpressionAttributeValues: {
          ':likedBy': updatedLikedBy,
          ':likesCount': newLikesCount,
        },
      });

      await this.dynamoClient.send(command);
      return { liked: false, likesCount: newLikesCount };
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async isPostLikedByUser(postId: string, userId: string) {
    try {
      const post = await this.getPostById(postId);
      if (!post) {
        return false;
      }

      const likedBy = post.likedBy || [];
      return likedBy.includes(userId);
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  async getPostById(postId: string) {
    try {
      // Try to find post by postId (string)
      const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': postId,
        },
      });

      const response = await this.dynamoClient.send(command);
      return response.Items?.[0] || null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      return null;
    }
  }

  async deletePost(postId: string) {
    const postToDelete = await this.getPostById(postId);
    if (!postToDelete) {
      throw new Error('Post not found');
    }

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        userID: postToDelete.userID,
      },
    });

    try {
      await this.dynamoClient.send(command);
      console.log('Post deleted successfully:', postId);
      return postToDelete;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async updateUserAvatar(userId: string, avatarUrl: string) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    
    // Try to convert to number first, then fallback to string
    const numericUserId = parseInt(userId, 10);
    
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        userID: isNaN(numericUserId) ? userId : numericUserId,
      },
      UpdateExpression: 'SET avatarUrl = :avatarUrl',
      ExpressionAttributeValues: {
        ':avatarUrl': avatarUrl,
      },
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await this.dynamoClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw error;
    }
  }

  async incrementUserPostCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for post count increment:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'ADD postCount :incr',
      ExpressionAttributeValues: { ':incr': 1 },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully incremented postCount for user ${userId}`);
    } catch (error) {
      console.error(`Error incrementing postCount for user ${userId}:`, error);
      // We re-throw the error to ensure the calling service is aware of the failure.
      throw error;
    }
  }

  async decrementUserPostCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for post count decrement:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'SET postCount = postCount - :decr',
      ConditionExpression: 'postCount > :zero', // prevent going below 0
      ExpressionAttributeValues: {
        ':decr': 1,
        ':zero': 0,
      },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully decremented postCount for user ${userId}`);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.warn(`Could not decrement post count for user ${userId}. Count is likely already at 0.`);
      } else {
        console.error(`Error decrementing postCount for user ${userId}:`, error);
        throw error;
      }
    }
  }

  async incrementUserLikesCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for likes count increment:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'ADD likesCount :incr',
      ExpressionAttributeValues: { ':incr': 1 },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully incremented likesCount for user ${userId}`);
    } catch (error) {
      console.error(`Error incrementing likesCount for user ${userId}:`, error);
      throw error;
    }
  }

  async decrementUserLikesCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for likes count decrement:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'SET likesCount = likesCount - :decr',
      ConditionExpression: 'likesCount > :zero',
      ExpressionAttributeValues: {
        ':decr': 1,
        ':zero': 0,
      },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully decremented likesCount for user ${userId}`);
    } catch (error) {
      console.error(`Error decrementing likesCount for user ${userId}:`, error);
      throw error;
    }
  }

  async incrementUserCommentsCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for comments count increment:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'ADD commentsCount :incr',
      ExpressionAttributeValues: { ':incr': 1 },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully incremented commentsCount for user ${userId}`);
    } catch (error) {
      console.error(`Error incrementing commentsCount for user ${userId}:`, error);
      throw error;
    }
  }

  async decrementUserCommentsCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for comments count decrement:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'SET commentsCount = commentsCount - :decr',
      ConditionExpression: 'commentsCount > :zero',
      ExpressionAttributeValues: {
        ':decr': 1,
        ':zero': 0,
      },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully decremented commentsCount for user ${userId}`);
    } catch (error) {
      console.error(`Error decrementing commentsCount for user ${userId}:`, error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      console.log(`Starting comprehensive user deletion for userId: ${userId}`);
      
      // 1. Get all posts by this user
      const userPosts = await this.getPostsByAuthor(userId);
      console.log(`Found ${userPosts.length} posts by user ${userId}`);
      
      // 2. Delete all posts by this user
      for (const post of userPosts) {
        try {
          await this.deletePost(post.postId);
          console.log(`Deleted post ${post.postId} by user ${userId}`);
        } catch (error) {
          console.error(`Error deleting post ${post.postId}:`, error);
        }
      }
      
      // 3. Remove user's likes from all posts
      const allPosts = await this.getAllPosts();
      for (const post of allPosts) {
        if (post.likedBy && post.likedBy.includes(userId)) {
          try {
            await this.unlikePost(post.postId, userId);
            console.log(`Removed like from post ${post.postId} by user ${userId}`);
          } catch (error) {
            console.error(`Error removing like from post ${post.postId}:`, error);
          }
        }
      }
      
      // 4. Remove user from other users' friends lists
      const allUsers = await this.getAllUsers();
      for (const user of allUsers) {
        if (user.friends && user.friends.includes(userId)) {
          try {
            await this.removeFriend(user.userId, userId);
            console.log(`Removed user ${userId} from ${user.userId}'s friends list`);
          } catch (error) {
            console.error(`Error removing user ${userId} from ${user.userId}'s friends list:`, error);
          }
        }
      }
      
      // 5. Finally delete the user
      const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
      
      // Try to convert to number first, then fallback to string
      const numericUserId = parseInt(userId, 10);
      
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: {
          userID: isNaN(numericUserId) ? userId : numericUserId,
        },
      });

      await this.dynamoClient.send(command);
      console.log(`User deleted successfully: ${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Friends methods
  async addFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const numericUserId = parseInt(userId, 10);
      const numericFriendId = parseInt(friendId, 10);
      
      if (isNaN(numericUserId) || isNaN(numericFriendId)) {
        console.error('Invalid userId or friendId for adding friend:', userId, friendId);
        return false;
      }

      // Get current user to check if friend already exists
      const user = await this.getUserById(userId);
      if (!user) {
        console.error('User not found:', userId);
        return false;
      }

      const friends = user.friends || [];
      if (friends.includes(friendId)) {
        console.log(`User ${userId} is already friends with ${friendId}`);
        return false; // Already friends
      }

      // Add friend to user's friends list and increment friends count
      const updatedFriends = [...friends, friendId];
      const newFriendsCount = friends.length + 1;

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: numericUserId },
        UpdateExpression: 'SET friends = :friends, friendsCount = :friendsCount',
        ExpressionAttributeValues: {
          ':friends': updatedFriends,
          ':friendsCount': newFriendsCount,
        },
      });

      await this.dynamoClient.send(command);
      console.log(`Successfully added friend ${friendId} to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error adding friend for user ${userId}:`, error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const numericUserId = parseInt(userId, 10);
      const numericFriendId = parseInt(friendId, 10);
      
      if (isNaN(numericUserId) || isNaN(numericFriendId)) {
        console.error('Invalid userId or friendId for removing friend:', userId, friendId);
        return false;
      }

      // Get current user to check if friend exists
      const user = await this.getUserById(userId);
      if (!user) {
        console.error('User not found:', userId);
        return false;
      }

      const friends = user.friends || [];
      if (!friends.includes(friendId)) {
        console.log(`User ${userId} is not friends with ${friendId}`);
        return false; // Not friends
      }

      // Remove friend from user's friends list and decrement friends count
      const updatedFriends = friends.filter(id => id !== friendId);
      const newFriendsCount = Math.max(0, friends.length - 1);

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: numericUserId },
        UpdateExpression: 'SET friends = :friends, friendsCount = :friendsCount',
        ExpressionAttributeValues: {
          ':friends': updatedFriends,
          ':friendsCount': newFriendsCount,
        },
      });

      await this.dynamoClient.send(command);
      console.log(`Successfully removed friend ${friendId} from user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error removing friend for user ${userId}:`, error);
      throw error;
    }
  }

  async getFriends(userId: string): Promise<any[]> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.friends || user.friends.length === 0) {
        return [];
      }

      // Get all friends' user data
      const friendsData: any[] = [];
      for (const friendId of user.friends) {
        const friend = await this.getUserById(friendId);
        if (friend) {
          friendsData.push({
            userId: friend.userId,
            username: friend.username,
            fullName: friend.fullName,
            avatarUrl: friend.avatarUrl,
            postCount: friend.postCount || 0,
            dateJoined: friend.dateJoined,
          });
        }
      }

      return friendsData;
    } catch (error) {
      console.error(`Error getting friends for user ${userId}:`, error);
      return [];
    }
  }

  async isFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.friends) {
        return false;
      }
      return user.friends.includes(friendId);
    } catch (error) {
      console.error(`Error checking friendship status:`, error);
      return false;
    }
  }

  async incrementUserFriendsCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for friends count increment:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'ADD friendsCount :incr',
      ExpressionAttributeValues: { ':incr': 1 },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully incremented friendsCount for user ${userId}`);
    } catch (error) {
      console.error(`Error incrementing friendsCount for user ${userId}:`, error);
      throw error;
    }
  }

  async decrementUserFriendsCount(userId: string): Promise<void> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid userId for friends count decrement:', userId);
      return;
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { userID: numericUserId },
      UpdateExpression: 'SET friendsCount = friendsCount - :decr',
      ConditionExpression: 'friendsCount > :zero',
      ExpressionAttributeValues: {
        ':decr': 1,
        ':zero': 0,
      },
    });

    try {
      await this.dynamoClient.send(command);
      console.log(`Successfully decremented friendsCount for user ${userId}`);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.warn(`Could not decrement friendsCount for user ${userId}. Count is likely already at 0.`);
      } else {
        console.error(`Error decrementing friendsCount for user ${userId}:`, error);
        throw error;
      }
    }
  }

  // Comment methods
  async createComment(postId: string, userId: string, author: any, content: string) {
    try {
      const post = await this.getPostById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const commentId = Date.now() + Math.floor(Math.random() * 1000);
      const timestamp = new Date().toISOString();

      const comment = {
        commentId: commentId.toString(),
        postId,
        authorId: userId,
        authorUsername: author.username,
        authorFullName: author.fullName,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Add comment to post's comments array
      const comments = post.comments || [];
      const updatedComments = [...comments, comment];
      const newCommentsCount = comments.length + 1;

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: post.userID },
        UpdateExpression: 'SET comments = :comments, commentsCount = :commentsCount',
        ExpressionAttributeValues: {
          ':comments': updatedComments,
          ':commentsCount': newCommentsCount,
        },
      });

      await this.dynamoClient.send(command);
      console.log(`Comment created successfully for post ${postId}`);
      return { comment, commentsCount: newCommentsCount };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    try {
      const post = await this.getPostById(postId);
      if (!post) {
        return [];
      }
      return post.comments || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async deleteComment(postId: string, commentId: string, userId: string) {
    try {
      const post = await this.getPostById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const comments = post.comments || [];
      const commentIndex = comments.findIndex(c => c.commentId === commentId);
      
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }

      const comment = comments[commentIndex];
      if (comment.authorId !== userId) {
        throw new Error('You are not authorized to delete this comment');
      }

      // Remove comment from array
      const updatedComments = comments.filter(c => c.commentId !== commentId);
      const newCommentsCount = Math.max(0, comments.length - 1);

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { userID: post.userID },
        UpdateExpression: 'SET comments = :comments, commentsCount = :commentsCount',
        ExpressionAttributeValues: {
          ':comments': updatedComments,
          ':commentsCount': newCommentsCount,
        },
      });

      await this.dynamoClient.send(command);
      console.log(`Comment deleted successfully from post ${postId}`);
      return { commentsCount: newCommentsCount };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async updateUserGitHubId(userId: string, githubId: string) {
    const numericUserId = parseInt(userId, 10);
    
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        userID: isNaN(numericUserId) ? userId : numericUserId,
      },
      UpdateExpression: 'SET githubId = :githubId',
      ExpressionAttributeValues: {
        ':githubId': githubId,
      },
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await this.dynamoClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error('Error updating GitHub ID:', error);
      throw error;
    }
  }

  async updateUserGoogleId(userId: string, googleId: string) {
    const numericUserId = parseInt(userId, 10);
    
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        userID: isNaN(numericUserId) ? userId : numericUserId,
      },
      UpdateExpression: 'SET googleId = :googleId',
      ExpressionAttributeValues: {
        ':googleId': googleId,
      },
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await this.dynamoClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error('Error updating Google ID:', error);
      throw error;
    }
  }
}
 