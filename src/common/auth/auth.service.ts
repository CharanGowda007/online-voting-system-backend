import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { BlackListTokenService } from './services/blackListToken.service';
import { UserTokenPayload } from './types/userToken.payload';

/** Message thrown when refresh token is blacklisted (already used or invalidated). Frontend can check for this to redirect to /login. */
export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again!';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly blackListService: BlackListTokenService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.blackListService.syncBlacklistWithRedis('app1');
    } catch (error) {
      this.logger.warn(
        'Failed to sync blacklisted tokens on module init:',
        (error as Error).message,
      );
    }
  }

  async generateJWTTokenWithRefresh(
    userTokenPayload: UserTokenPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret =
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!accessSecret || !refreshSecret) {
      this.logger.error(
        'JWT secret(s) missing. Set JWT_SECRET or JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env',
      );
      throw new HttpException(
        'Server configuration error: JWT secret not set. Set JWT_SECRET in .env and restart.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
      const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      const payload = { ...userTokenPayload };
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessTokenExpiresIn,
      } as Record<string, unknown>);
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshTokenExpiresIn,
      } as Record<string, unknown>);
      return { accessToken, refreshToken };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(
        `Error generating JWT token: ${message}`,
        (error as Error).stack,
      );
      throw new HttpException(
        message?.includes('secret') || message?.includes('key')
          ? 'Server configuration error: JWT secret not set or invalid. Set JWT_SECRET in .env and restart.'
          : 'Unable to generate JWT token.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async refreshToken(
    refreshTokenFromClient: string,
    userDetails?: any,
  ): Promise<any> {
    try {
      const isTokenBlacklisted = await this.blackListService.isTokenBlacklisted(
        refreshTokenFromClient,
      );
      if (isTokenBlacklisted) {
        throw new HttpException(
          SESSION_EXPIRED_MESSAGE,
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.jwtService.verify(refreshTokenFromClient, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });
      const userTokenPayload = new UserTokenPayload();
      userTokenPayload.userId = userDetails.userId;
      userTokenPayload.loginId = userDetails.loginId;
      userTokenPayload.departmentId = userDetails.departmentId;
      userTokenPayload.postId = userDetails.postId;
      userTokenPayload.role = userDetails.role;
      userTokenPayload.permissions = userDetails.permissions || [];
      userTokenPayload.postName = userDetails.postName;
      userTokenPayload.locationId = userDetails.locationId;
      userTokenPayload.locationName = userDetails.locationName;
      const { accessToken, refreshToken } =
        await this.generateJWTTokenWithRefresh(userTokenPayload);
      await this.blackListService.blacklistToken(
        refreshTokenFromClient,
        Number(process.env.REFRESH_EXPIRY) || 604800,
        userDetails.namespace || 'blacklist',
      );
      return {
        accessToken,
        refreshToken,
        role: userDetails.role,
        permission: userDetails.permissions,
        locationId: userDetails.locationId,
        locationName: userDetails.locationName,
        ...userDetails,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateRefreshFromCookie(
    refreshTokenFromClient: RefreshTokenDto,
  ): Promise<any> {
    try {
      const userDetailsFromToken = this.jwtService.decode(
        refreshTokenFromClient.refreshToken,
      );
      if (!userDetailsFromToken || typeof userDetailsFromToken === 'string') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      const userDetails = userDetailsFromToken as any;
      const isTokenBlacklisted = await this.blackListService.isTokenBlacklisted(
        refreshTokenFromClient.refreshToken,
      );
      if (isTokenBlacklisted) {
        throw new HttpException(
          SESSION_EXPIRED_MESSAGE,
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.jwtService.verifyAsync(refreshTokenFromClient.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });
      const userTokenPayload = new UserTokenPayload();
      userTokenPayload.userId = userDetails.id ?? userDetails.userId;
      userTokenPayload.role = userDetails.role;
      userTokenPayload.loginId = userDetails.loginId;
      userTokenPayload.permissions = userDetails.permissions || [];
      userTokenPayload.departmentId = userDetails.departmentId;
      userTokenPayload.postId = userDetails.postId;
      userTokenPayload.postName = userDetails.postName;
      userTokenPayload.managersAssignedToPost =
        userDetails.managersAssignedToPost;
      const { accessToken, refreshToken } =
        await this.generateJWTTokenWithRefresh(userTokenPayload);
      await this.blackListService.blacklistToken(
        refreshTokenFromClient.refreshToken,
        Number(process.env.REFRESH_EXPIRY) || 604800,
        userDetails.namespace || 'blacklist',
      );
      const response: any = {
        accessToken,
        refreshToken,
        role: userDetails.role,
        permission: userDetails.permissions,
        managersAssignedToPost: userDetails.managersAssignedToPost,
      };
      for (const key in userDetails) {
        response[key] = userDetails[key];
      }
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  validateUser(payload: any): any {
    return payload;
  }
}