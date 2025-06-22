/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from '../../AWS/s3.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private s3Service: S3Service,
  ) {}

  // validates if a user exists or not
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    // if user exists, then proceed to check the password
    if (user && (await this.usersService.validatePassword(user, pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...rest } = user;
      return rest;
    }
    return null;
  }

  // generates a jwt token
  login(user: any) {
    const payload = { username: user.username, sub: user.userId };

    // The avatarUrl now contains the file key directly
    const profilePictureKey = user.avatarUrl || null;

    return {
      access_token: this.jwtService.sign(payload), // sign the payload
      user: {
        username: user.username,
        userId: user.userId,
        profilePictureKey: profilePictureKey, // Store file key instead of signed URL
        email: user.email || null,
      },
    };
  }
}
