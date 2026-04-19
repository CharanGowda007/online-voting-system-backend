import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachingUtil } from '@/common/core/utils/caching.util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig from './config/jwt.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { BlackListedTokens } from './models/blackListTokens.model';
import { BlackListTokenService } from './services/blackListToken.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([BlackListedTokens]),
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get('jwt');
        const issuer =
          jwt?.signOptions?.issuer || process.env.JWT_ISSUER || 'cas-backend';
        return {
          secret:
            jwt?.secret ||
            process.env.JWT_SECRET ||
            process.env.JWT_ACCESS_SECRET,
          signOptions: {
            issuer: typeof issuer === 'string' ? issuer : 'cas-backend',
            expiresIn:
              jwt?.signOptions?.expiresIn || process.env.JWT_EXPIRES_IN || '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    CachingUtil,
    BlackListTokenService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    passportModule,
    AuthService,
    BlackListTokenService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}