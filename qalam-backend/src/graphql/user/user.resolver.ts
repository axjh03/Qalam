import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../../InternalAPI/users/users.service';
import { AuthService } from '../../InternalAPI/auth/auth.service';
import { JwtAuthGuard } from '../../InternalAPI/auth/jwt-auth.guard';
import { User, UserProfile } from './user.model';
import { CreateUserInput, UpdateUserInput, LoginInput } from './user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Query(() => UserProfile, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Args('username') username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      return null;
    }
    return {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      postCount: user.postCount || 0,
      likesCount: user.likesCount || 0,
      commentCount: user.commentCount || 0,
      followerCount: user.followerCount || 0,
      dateJoined: user.dateJoined,
      email: user.email,
    };
  }

  @Query(() => UserProfile)
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Context() context: any) {
    const user = await this.usersService.findOne(context.req.user.username);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      postCount: user.postCount || 0,
      likesCount: user.likesCount || 0,
      commentCount: user.commentCount || 0,
      followerCount: user.followerCount || 0,
      dateJoined: user.dateJoined,
      email: user.email,
    };
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async getFriends(@Context() context: any) {
    const userId = context.req.user.userId;
    return await this.usersService.getFriends(userId);
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async getUserFriends(@Args('username') username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.usersService.getFriends(user.userId);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput) {
    const user = await this.usersService.createUser(input);
    return {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      postCount: user.postCount || 0,
      likesCount: user.likesCount || 0,
      commentCount: user.commentCount || 0,
      followerCount: user.followerCount || 0,
      dateJoined: user.dateJoined,
    };
  }

  @Mutation(() => String)
  async login(@Args('input') input: LoginInput) {
    const user = await this.usersService.findOne(input.username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isValidPassword = await this.usersService.validatePassword(
      user,
      input.password,
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateAvatar(
    @Context() context: any,
    @Args('avatarUrl') avatarUrl: string,
  ) {
    const userId = context.req.user.userId;
    const updatedUser = await this.usersService.updateAvatar(userId, avatarUrl);
    if (!updatedUser) throw new Error('User not found');
    return {
      userId: updatedUser.userId,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      postCount: updatedUser.postCount || 0,
      likesCount: updatedUser.likesCount || 0,
      commentCount: updatedUser.commentCount || 0,
      followerCount: updatedUser.followerCount || 0,
      dateJoined: updatedUser.dateJoined,
    };
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async addFriend(
    @Context() context: any,
    @Args('friendId') friendId: string,
  ) {
    const userId = context.req.user.userId;
    await this.usersService.addFriend(userId, friendId);
    return 'Friend added successfully';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @Context() context: any,
    @Args('friendId') friendId: string,
  ) {
    const userId = context.req.user.userId;
    await this.usersService.removeFriend(userId, friendId);
    return 'Friend removed successfully';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Context() context: any) {
    const userId = context.req.user.userId;
    await this.usersService.deleteUser(userId);
    return 'Account deleted successfully';
  }
} 