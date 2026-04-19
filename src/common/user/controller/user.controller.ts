import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/auth/guards/permissions.guard';
import { Permissions } from 'src/common/auth/decorators/permissions.decorator';
import { UserService } from '../service/user.service';
import { ChangePasswordDto } from '../dto/userLogin.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('auth/me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER:VIEW')
  async me(@Req() req: any, @Res() res: any): Promise<any> {
    try {
      const refreshToken = req?.cookies?.refreshToken;
      if (!refreshToken) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const response = await this.userService.me(refreshToken);
      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      delete response.password;
      delete response.refreshToken;
      return res.json({ success: true, data: response });
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException((error as Error).message, status);
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER:UPDATE')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userContext = req.user;
    if (!userContext?.loginId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.changePassword(userContext, changePasswordDto);
  }
}

