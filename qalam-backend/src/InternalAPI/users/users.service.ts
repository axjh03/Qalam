import { Injectable, ConflictException } from '@nestjs/common';
import { DynamoDBService } from '../../AWS/dynamodb.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../../AWS/s3.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly s3Service: S3Service
  ) {}

  async findOne(username: string) {
    try {
      return await this.dynamoDBService.getUserByUsername(username);
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  async findById(userId: string) {
    try {
      return await this.dynamoDBService.getUserById(userId);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
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
    try {
      // Check if username already exists
      const existingUser = await this.dynamoDBService.getUserByUsername(
        userData.username,
      );
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      // Check if email already exists
      const existingEmail = await this.dynamoDBService.getUserByEmail(
        userData.email,
      );
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user in DynamoDB
      const user = await this.dynamoDBService.createUser({
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        password: passwordHash,
        avatarUrl: userData.avatarUrl,
        githubId: userData.githubId,
        googleId: userData.googleId,
      });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.dynamoDBService.getAllUsers();
      // Remove sensitive information and return only necessary user data
      return users.map(user => ({
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        postCount: user.postCount || 0,
        dateJoined: user.dateJoined,
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const updatedUser = await this.dynamoDBService.updateUserAvatar(userId, avatarUrl);
      return updatedUser;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.dynamoDBService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getProfilePictureUrl(userId: string) {
    const user = await this.dynamoDBService.getUserById(userId);
    if (!user || !user.avatarUrl) {
      return null;
    }

    // The avatarUrl is the full S3 key
    return this.s3Service.getSignedUrl(user.avatarUrl);
  }

  async incrementPostCount(userId: string) {
    await this.dynamoDBService.incrementUserPostCount(userId);
  }

  async decrementPostCount(userId: string) {
    await this.dynamoDBService.decrementUserPostCount(userId);
  }

  async incrementLikesCount(userId: string) {
    await this.dynamoDBService.incrementUserLikesCount(userId);
  }

  async decrementLikesCount(userId: string) {
    await this.dynamoDBService.decrementUserLikesCount(userId);
  }

  async incrementCommentsCount(userId: string) {
    await this.dynamoDBService.incrementUserCommentsCount(userId);
  }

  async decrementCommentsCount(userId: string) {
    await this.dynamoDBService.decrementUserCommentsCount(userId);
  }

  async addFriend(userId: string, friendId: string) {
    return await this.dynamoDBService.addFriend(userId, friendId);
  }

  async removeFriend(userId: string, friendId: string) {
    return await this.dynamoDBService.removeFriend(userId, friendId);
  }

  async getFriends(userId: string) {
    return await this.dynamoDBService.getFriends(userId);
  }

  async isFriend(userId: string, friendId: string) {
    return await this.dynamoDBService.isFriend(userId, friendId);
  }

  async incrementFriendsCount(userId: string) {
    await this.dynamoDBService.incrementUserFriendsCount(userId);
  }

  async decrementFriendsCount(userId: string) {
    await this.dynamoDBService.decrementUserFriendsCount(userId);
  }

  async updateGitHubId(userId: string, githubId: string) {
    try {
      return await this.dynamoDBService.updateUserGitHubId(userId, githubId);
    } catch (error) {
      console.error('Error updating GitHub ID:', error);
      throw error;
    }
  }

  async updateGoogleId(userId: string, googleId: string) {
    try {
      return await this.dynamoDBService.updateUserGoogleId(userId, googleId);
    } catch (error) {
      console.error('Error updating Google ID:', error);
      throw error;
    }
  }
}
