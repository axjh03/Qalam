import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { OAuthConfigService } from '../auth/oauth-config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly oauthConfig: OAuthConfigService,
  ) {
    if (!oauthConfig.isGoogleEnabled()) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: ['email', 'profile'],
      });
      return;
    }
    
    super(oauthConfig.getGoogleConfig());
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    try {
      if (!this.oauthConfig.isGoogleEnabled()) {
        return done(new Error('Google OAuth not configured'), null);
      }
      
      const { id, displayName, emails, photos } = profile;
      
      let email = emails?.[0]?.value;
      let avatarUrl = photos?.[0]?.value;
      
      if (!email) {
        return done(new Error('Email not found from Google'), null);
      }

      const usernameFromEmail = email.split('@')[0];
      const fullName = displayName || usernameFromEmail;

      let user = await this.usersService.findOne(usernameFromEmail);

      if (!user) {
        const userData = {
          username: usernameFromEmail,
          fullName: fullName,
          email: email,
          password: `google_${id}`,
          avatarUrl: avatarUrl,
          googleId: id,
        };

        user = await this.usersService.createUser(userData);
      } else {
        if (!user.googleId) {
          await this.usersService.updateGoogleId(user.userId, id);
        }
        if (avatarUrl && !user.avatarUrl) {
          await this.usersService.updateAvatar(user.userId, avatarUrl);
        }
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, null);
    }
  }
} 