import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiParam,
  ApiConsumes 
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { LocalAuthGuard } from './InternalAPI/auth/local-auth.guard';
import { AuthService } from './InternalAPI/auth/auth.service';
import { JwtAuthGuard } from './InternalAPI/auth/jwt-auth.guard';
import { GoogleAuthGuard } from './InternalAPI/auth/google-auth.guard';
import { GitHubAuthGuard } from './InternalAPI/auth/github-auth.guard';
import { UsersService } from './InternalAPI/users/users.service';
import { S3Service } from './AWS/s3.service';

interface AuthenticatedRequest {
  user: {
    userId: string;
    username: string;
  };
}

@ApiTags('Main API')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Hello message returned' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health status returned' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'qalam-backend',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiTags('auth')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('auth/signup')
  @ApiTags('auth')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatarUrl: { type: 'string', nullable: true },
      },
      required: ['username', 'fullName', 'email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async signup(
    @Body()
    signupData: {
      username: string;
      fullName: string;
      email: string;
      password: string;
      avatarUrl?: string;
    },
  ) {
    try {
      const user = await this.usersService.createUser(signupData);
      console.log('User signed up successfully:', user.username);
      return { message: 'User created successfully', user };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
  @Post('upload/presigned-url')
  @ApiTags('upload')
  @ApiOperation({ summary: 'Generate presigned URL for file upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        contentType: { type: 'string' },
      },
      required: ['fileName', 'contentType'],
    },
  })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  async generateUploadUrl(
    @Request() req: any,
    @Body()
    body: {
      fileName: string;
      contentType: string;
    },
  ) {
    try {
      // For testing, use a dummy user ID
      const userId = 'test-user-' + Date.now();
      const { uploadUrl, fileKey } = await this.s3Service.generateUploadUrl(
        body.fileName,
        body.contentType,
        userId,
      );

      return {
        uploadUrl,
        fileKey,
        publicUrl: this.s3Service.getPublicUrl(fileKey),
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
  }

  // Direct upload endpoint to avoid CORS issues
  @Post('upload/direct')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @ApiTags('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file directly to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    try {
      const userId = (req.user as { userId: string }).userId;
      const fileName = `${userId}/${Date.now()}-${file.originalname}`;

      // Upload directly to S3 from backend
      const { uploadUrl, fileKey } = await this.s3Service.generateUploadUrl(
        fileName,
        file.mimetype,
        userId,
      );

      // Upload the file to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      if (s3Response.ok) {
        // Use signed URL instead of public URL for better security
        const signedUrl = await this.s3Service.getSignedUrl(fileKey);
        console.log('✅ File uploaded to S3:', signedUrl);
        return {
          success: true,
          fileKey,
          publicUrl: signedUrl, // Return signed URL as publicUrl for compatibility
          message: 'File uploaded successfully',
        };
      } else {
        throw new Error('Failed to upload to S3');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload endpoint for signup (no authentication required)
  @Post('upload/signup')
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('upload')
  @ApiOperation({ summary: 'Upload file during signup' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        username: { type: 'string' },
      },
      required: ['username'],
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  async uploadFileForSignup(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { username: string },
  ) {
    try {
      const username = body.username;
      const fileName = `signup/${username}/${Date.now()}-${file.originalname}`;

      // Upload directly to S3 from backend
      const { uploadUrl, fileKey } = await this.s3Service.generateUploadUrl(
        fileName,
        file.mimetype,
        username,
      );

      // Upload the file to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      if (s3Response.ok) {
        // Use signed URL instead of public URL for better security
        const signedUrl = await this.s3Service.getSignedUrl(fileKey);
        console.log('✅ Signup file uploaded to S3:', signedUrl);
        return {
          success: true,
          fileKey,
          publicUrl: signedUrl, // Return signed URL as publicUrl for compatibility
          message: 'File uploaded successfully',
        };
      } else {
        throw new Error('Failed to upload to S3');
      }
    } catch (error) {
      console.error('Error uploading signup file:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/refresh-url')
  async refreshSignedUrl(
    @Body() body: { fileKey: string },
    @Request() req: any,
  ) {
    try {
      const signedUrl = await this.s3Service.getSignedUrl(body.fileKey);
      return {
        success: true,
        signedUrl,
      };
    } catch (error) {
      console.error('Error refreshing signed URL:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    console.log(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile-picture-url')
  async getProfilePictureUrl(@Request() req: any) {
    try {
      const userId = req.user.userId;
      const user = await this.usersService.findById(userId);

      if (!user || !user.avatarUrl) {
        return { profilePictureUrl: null };
      }

      // Use the key directly from the database instead of reconstructing it
      const fileKey = user.avatarUrl;
      
      const signedUrl = await this.s3Service.getSignedUrl(fileKey);
      return { profilePictureUrl: signedUrl };
    } catch (error) {
      console.error('Error getting profile picture URL:', error);
      return { profilePictureUrl: null };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Request() req: any) {
    try {
      const currentUserId = req.user.userId;
      const allUsers = await this.usersService.getAllUsers();
      
      // Filter out the current user
      const otherUsers = allUsers.filter(user => user.userId !== currentUserId);
      
      return { users: otherUsers };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/profile/:username')
  async getUserProfile(@Request() req: any, @Param('username') username: string) {
    try {
      const user = await this.usersService.findOne(username);
      
      if (!user) {
        return { error: 'User not found' };
      }

      // Return user data without sensitive information
      const userProfile = {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        postCount: user.postCount || 0,
        likesCount: user.likesCount || 0,
        commentsCount: user.commentsCount || 0,
        friendsCount: user.friendsCount || 0,
        dateJoined: user.dateJoined,
        email: user.email,
      };

      return { user: userProfile };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/profile/avatar')
  async updateProfilePicture(@Request() req: any, @Body() body: { avatarUrl: string }) {
    try {
      const userId = req.user.userId;
      const updatedUser = await this.usersService.updateAvatar(userId, body.avatarUrl);
      
      if (!updatedUser) {
        throw new Error('Failed to update user profile');
      }
      
      return { 
        message: 'Profile picture updated successfully',
        user: {
          userId: updatedUser.userId,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          avatarUrl: updatedUser.avatarUrl,
        }
      };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/delete')
  async deleteAccount(@Request() req: any) {
    try {
      const userId = req.user.userId;
      await this.usersService.deleteUser(userId);
      
      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  @Get('signed-url/*')
  @UseGuards(JwtAuthGuard)
  async getSignedUrlForKey(@Param('0') key: string) {
    if (!key) {
      throw new HttpException('S3 key is required', HttpStatus.BAD_REQUEST);
    }
    const signedUrl = await this.s3Service.getSignedUrl(key);
    return { url: signedUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/friends/add/:friendId')
  async addFriend(@Request() req: any, @Param('friendId') friendId: string) {
    try {
      const userId = req.user.userId;
      const success = await this.usersService.addFriend(userId, friendId);
      
      if (success) {
        return { message: 'Friend added successfully' };
      } else {
        return { message: 'Already friends or user not found' };
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/friends/remove/:friendId')
  async removeFriend(@Request() req: any, @Param('friendId') friendId: string) {
    try {
      const userId = req.user.userId;
      const success = await this.usersService.removeFriend(userId, friendId);
      
      if (success) {
        return { message: 'Friend removed successfully' };
      } else {
        return { message: 'Not friends or user not found' };
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/friends')
  async getFriends(@Request() req: any) {
    try {
      const userId = req.user.userId;
      const friends = await this.usersService.getFriends(userId);
      return { friends };
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/friends/check/:friendId')
  async checkFriendship(@Request() req: any, @Param('friendId') friendId: string) {
    try {
      const userId = req.user.userId;
      const isFriend = await this.usersService.isFriend(userId, friendId);
      return { isFriend };
    } catch (error) {
      console.error('Error checking friendship:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/profile/:username/friends')
  async getUserFriends(@Request() req: any, @Param('username') username: string) {
    try {
      const user = await this.usersService.findOne(username);
      
      if (!user) {
        return { error: 'User not found' };
      }

      const friends = await this.usersService.getFriends(user.userId);
      return { friends };
    } catch (error) {
      console.error('Error getting user friends:', error);
      throw error;
    }
  }

  @Get('auth/github')
  @UseGuards(GitHubAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub' })
  @ApiResponse({ status: 400, description: 'GitHub OAuth not configured' })
  async githubAuth() {
    // This will be handled by the GitHubAuthGuard
  }

  @Get('auth/github/callback')
  @UseGuards(GitHubAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'GitHub login successful' })
  @ApiResponse({ status: 400, description: 'GitHub OAuth not configured' })
  async githubAuthCallback(@Request() req, @Res() res) {
    const loginResult = await this.authService.login(req.user);
    
    // Redirect to frontend with JWT token as URL parameter
    const frontendUrl = `http://localhost:5173?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;
    
    res.redirect(frontendUrl);
  }

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured' })
  async googleAuth() {
    // This will be handled by the GoogleAuthGuard
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured' })
  async googleAuthCallback(@Request() req, @Res() res) {
    const loginResult = await this.authService.login(req.user);
    
    // Redirect to frontend with JWT token as URL parameter
    const frontendUrl = `http://localhost:5173?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;
    
    res.redirect(frontendUrl);
  }

  @Get('test-oauth')
  @ApiTags('auth')
  @ApiOperation({ summary: 'Test OAuth configuration' })
  async testOAuth() {
    return {
      github: {
        configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        clientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
        clientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set',
      },
      google: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      }
    };
  }
}
