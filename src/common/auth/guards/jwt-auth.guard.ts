import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      this.logger.warn(
        `No Authorization header found for ${request.method} ${request.url}`,
      );
    }
    return super.canActivate(context) as boolean;
  }

  handleRequest(
    err: any,
    user: any,
    _info: any,
    context: ExecutionContext,
  ): any {
    const request = context.switchToHttp().getRequest();
    if (err) {
      this.logger.error(
        `JWT authentication error for ${request.method} ${request.url}: ${err?.message}`,
      );
      throw err || new UnauthorizedException();
    }
    if (!user) {
      this.logger.warn(
        `JWT authentication failed - no user found for ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
