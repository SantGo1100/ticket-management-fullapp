import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Get headers - Express normalizes headers to lowercase, but handle all cases
    const getHeader = (name: string): string | undefined => {
      const lowerName = name.toLowerCase();
      // Try lowercase first (Express default)
      if (request.headers[lowerName]) {
        return request.headers[lowerName] as string;
      }
      // Try original case
      if (request.headers[name]) {
        return request.headers[name] as string;
      }
      // Try all possible case variations
      const variations = [
        name.toUpperCase(),
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      ];
      for (const variant of variations) {
        if (request.headers[variant]) {
          return request.headers[variant] as string;
        }
      }
      return undefined;
    };

    const accountSid = getHeader('x-account-sid');
    const apiKey = getHeader('x-api-key');

    // Validate headers are present
    if (!accountSid || !apiKey) {
      const missingHeaders = [];
      if (!accountSid) missingHeaders.push('x-account-sid');
      if (!apiKey) missingHeaders.push('x-api-key');
      throw new UnauthorizedException(
        `Missing required headers: ${missingHeaders.join(', ')}`,
      );
    }

    // Trim whitespace from headers
    const trimmedSid = accountSid.trim();
    const trimmedKey = apiKey.trim();

    // Log in development to help debug (remove in production for security)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] Attempting authentication with SID: ${trimmedSid.substring(0, 5)}...`);
    }

    // Validate account and API key
    const account = await this.authService.validateAccountAndApiKey(
      trimmedSid,
      trimmedKey,
    );

    // Attach account to request for use in controllers
    request.user = account;

    return true;
  }
}

