import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/auth/guards/permissions.guard';
import { Permissions } from '@/common/auth/decorators/permissions.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('AUTH:REFRESH')
  async refresh(@Req() req: any, @Res() res: any): Promise<void> {
    const userDetails = req.user;
    const refreshToken = req?.cookies?.refreshToken;
    const response = await this.authService.refreshToken(
      refreshToken,
      userDetails,
    );
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    delete response.refreshToken;
    res.json({ success: true, statusCode: 200, data: { ...response } });
  }

  @Get('me')
  async getAccessToken(@Req() req: any, @Res() res: any): Promise<void> {
    const refreshTokenFromClient = req.cookies?.refreshToken;
    if (!refreshTokenFromClient) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const response = await this.authService.validateRefreshFromCookie({
      refreshToken: refreshTokenFromClient,
    });
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    delete response.refreshToken;
    res.json({ success: true, statusCode: 200, data: { ...response } });
  }
}