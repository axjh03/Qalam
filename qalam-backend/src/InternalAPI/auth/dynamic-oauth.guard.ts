import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DynamicOAuthGuard extends AuthGuard(['github', 'google']) implements CanActivate {
  constructor(private readonly provider: 'github' | 'google') {
    super(provider);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    if (this.provider === 'github' && (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)) {
      return false;
    }
    
    if (this.provider === 'google' && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
      return false;
    }
    
    return super.canActivate(context) as boolean;
  }
} 