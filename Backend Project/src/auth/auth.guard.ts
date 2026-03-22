import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.body.userId || request.query.userId;
    // For now, if a userId is provided, we allow it (mock for guest)
    if (!user) {
      throw new UnauthorizedException('No user identity provided');
    }
    return true;
  }
}
