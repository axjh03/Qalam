import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { OAuthConfigService } from '../auth/oauth-config.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly oauthConfig: OAuthConfigService,
  ) {
    if (!oauthConfig.isGitHubEnabled()) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:3000/auth/github/callback',
        scope: ['user:email'],
      });
      return;
    }
    
    super(oauthConfig.getGitHubConfig());
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    try {
      if (!this.oauthConfig.isGitHubEnabled()) {
        return done(new Error('GitHub OAuth not configured'), null);
      }
      
      const { id, username, displayName, emails, photos } = profile;
      
      let email = emails?.[0]?.value;
      let avatarUrl = photos?.[0]?.value;
      
      if (!email) {
        return done(new Error('Email not found from GitHub'), null);
      }

      const usernameFromEmail = email.split('@')[0];
      const finalUsername = username || usernameFromEmail;
      const fullName = displayName || usernameFromEmail;

      let user = await this.usersService.findOne(finalUsername);

      if (!user) {
        const userData = {
          username: finalUsername,
          fullName: fullName,
          email: email,
          password: `github_${id}`, 
          avatarUrl: avatarUrl,
          githubId: id,
        };

        user = await this.usersService.createUser(userData);
      } else {
        if (!user.githubId) {
          await this.usersService.updateGitHubId(user.userId, id);
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