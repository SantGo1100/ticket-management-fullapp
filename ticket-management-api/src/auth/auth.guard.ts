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
    const accountSid = request.headers['x-account-sid'];
    const apiKey = request.headers['x-api-key'];

    // Validate headers are present
    if (!accountSid || !apiKey) {
      throw new UnauthorizedException(
        'Missing required headers: x-account-sid and x-api-key',
      );
    }

    // Validate account and API key
    const account = await this.authService.validateAccountAndApiKey(
      accountSid,
      apiKey,
    );

    // Attach account to request for use in controllers
    request.user = account;

    return true;
  }
}

