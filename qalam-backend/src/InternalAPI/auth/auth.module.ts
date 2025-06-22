import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from '../passport/jwtConstants';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../passport/jwt.stratergy';
import { LocalStrategy } from '../passport/local.stratergy';
import { GoogleStrategy } from '../passport/google.strategy';
import { GitHubStrategy } from '../passport/github.strategy';
import { OAuthConfigService } from './oauth-config.service';
import { AWSModule } from '../../AWS/aws.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AWSModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, GitHubStrategy, OAuthConfigService],
  exports: [AuthService],
})
export class AuthModule {}
