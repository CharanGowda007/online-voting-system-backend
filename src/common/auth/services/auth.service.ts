import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UserService))
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Attempting to register new user: ${registerDto.mobile}`);
      const user = await this.usersService.create({
        aliasLoginName: registerDto.mobile,
        loginId: registerDto.mobile,
        password: registerDto.password,
      });

      const payload = { sub: user.id, loginId: user.loginId };
      const access_token = this.jwtService.sign(payload);

      this.logger.debug(`User registered successfully: ID ${user.id}`);
      return {
        access_token,
        user: {
          id: user.id.toString(),
          name: user.aliasLoginName,
          mobile: user.loginId,
        },
      };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        this.logger.warn(`Registration conflict for mobile: ${registerDto.mobile}`);
        throw error;
      }
      this.logger.error(`Registration failed for mobile: ${registerDto.mobile}`, error.stack);
      throw new Error('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Processing login attempt for identifier: ${loginDto.mobile}`);
    const user = await this.usersService.findByLoginId(loginDto.mobile);

    // Strict case-sensitive check
    if (!user || user.loginId !== loginDto.mobile) {
      this.logger.warn(`Login failed: User not found or mismatch for ${loginDto.mobile}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password provided for ${loginDto.mobile}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, loginId: user.loginId };
    const access_token = this.jwtService.sign(payload);

    this.logger.debug(`Login successful: Signed JWT token for User ID ${user.id}`);
    return {
      access_token,
      user: {
        id: user.id.toString(),
        name: user.aliasLoginName,
        mobile: user.loginId,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return await this.usersService.findById(userId);
  }

  async generateJWTTokenWithRefresh(payload: any) {
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    } as any);
    return { accessToken: access_token, refreshToken: refresh_token };
  }
}
