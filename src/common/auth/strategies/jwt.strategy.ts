import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CachingUtil } from 'src/common/core/utils/caching.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private readonly cachingUtil: CachingUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_SECRET ||
        configService.get<string>('JWT_ACCESS_SECRET') ||
        configService.get<string>('jwt.secret') ||
        process.env.JWT_SECRET ||
        'default-secret-key-change-in-production',
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any): Promise<any> {
    if (!payload) {
      this.logger.warn('JWT payload is missing or invalid');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (payload.mimic === true) {
      if (
        ['PUT', 'DELETE', 'PATCH', 'UPDATE', 'POST'].includes(request.method)
      ) {
        this.logger.warn(
          `Mimic user attempted ${request.method} operation which is not allowed`,
        );
        throw new HttpException(
          'you are not allowed to do this action',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
    if (request?.headers?.authorization) {
      const authHeader = request.headers.authorization;
      const token = authHeader.split(' ')[1];
      if (token) {
        const cacheKey = `blacklist:${token}`;
        const isBlacklisted = await this.cachingUtil.getCache(cacheKey);
        if (isBlacklisted) {
          this.logger.warn(
            `Token is blacklisted for loginId: ${payload.loginId || 'unknown'}`,
          );
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
      }
    }
    return payload;
  }
}
