import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserTokenPayload } from '../types/userToken.payload.js';

/** Set to true when ready to enforce permission checks. */
const ENABLE_PERMISSION_CHECK = false;

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!ENABLE_PERMISSION_CHECK) {
      return true;
    }

    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserTokenPayload = request.user;

    if (!user || !user.permissions) {
      this.logger.warn(
        `Permissions Guard: User or user permissions missing in JWT payload for ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Missing user permissions.');
    }

    const hasPermission = requiredPermissions.some(permission =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Permissions Guard: User ${user.loginId} lacks required permissions for ${request.method} ${request.url}. Required: ${requiredPermissions.join(', ')}, User has: ${user.permissions.join(', ')}`,
      );
      throw new UnauthorizedException('Insufficient permissions.');
    }

    this.logger.debug(
      `Permissions Guard: User ${user.loginId} has required permissions for ${request.method} ${request.url}`,
    );
    return true;
  }
}
