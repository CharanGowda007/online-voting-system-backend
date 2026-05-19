import { Controller, Post, Body, HttpCode, Req, Res, HttpStatus, HttpException, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { PublicService } from '../service/public.service';
import { UserLoginDto, ChangePasswordDto } from '../dto/userLogin.dto';
import { CachingUtil } from 'src/common/core/utils/caching.util';
import { JwtAuthGuard } from 'src/common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/auth/guards/permissions.guard';
import { Permissions } from 'src/common/auth/decorators/permissions.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly publicService: PublicService,
        private readonly cachingUtil: CachingUtil,
    ) {}

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login for both Applicants and Users' })
    async login(@Body() loginDto: UserLoginDto, @Res() res: any) {
        try {
            // Validate Captcha
            const isCaptchaValid = await this.publicService.validateCaptcha(
                loginDto.captchaId,
                loginDto.captchaText
            );

            if (!isCaptchaValid) {
                throw new HttpException('Invalid Captcha', HttpStatus.BAD_REQUEST);
            }

            const response = await this.userService.login(loginDto);
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            delete response.refreshToken;
            delete response.password;
            return res.json({ success: true, ...response });
        } catch (error) {
            const status = error instanceof HttpException ? error.getStatus() : HttpStatus.UNAUTHORIZED;
            throw new HttpException(error.message, status);
        }
    }

    @Get('logout')
    @ApiOperation({ summary: 'Logout and invalidate session' })
    async logout(
        @Req() req: any, 
        @Res() res: any, 
        @Query('loginId') loginId: string, 
        @Query('hId') hId: string
    ) {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        const result = await this.userService.logout(
            bearerToken, 
            this.cachingUtil, 
            loginId, 
            hId ? parseInt(hId, 10) : undefined
        );
        return res.json(result);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('USER:VIEW')
    @ApiOperation({ summary: 'Get current user profile and refresh token' })
    async me(@Req() req: any, @Res() res: any) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            const response = await this.userService.me(refreshToken);
            res.cookie('refreshToken', response.refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict' 
            });
            delete response.password;
            delete response.refreshToken;
            return res.json({ success: true, data: response });
        } catch (error) {
            const status = error instanceof HttpException ? error.getStatus() : HttpStatus.UNAUTHORIZED;
            throw new HttpException(error.message, status);
        }
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('USER:UPDATE')
    @ApiOperation({ summary: 'Change user password' })
    async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
        const userContext = req.user;
        if (!userContext?.loginId) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        return this.userService.changePassword(userContext, changePasswordDto);
    }
}
