import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { PublicService } from '../service/public.service';
import { RoleService } from '../service/role.service';
import { CachingUtil } from 'src/common/core/utils/caching.util';
import { ValidateCaptchaDto } from '../dto/validate-captcha.dto';
import { UserLoginDto } from '../dto/userLogin.dto';
import { RoleCode, ROLE_DISPLAY_NAMES } from '../enums/roleCode.enum';

@Controller('public')
export class PublicController {
  constructor(
    private readonly userService: UserService,
    private readonly publicService: PublicService,
    private readonly roleService: RoleService,
    private readonly cachingUtil: CachingUtil,
  ) {}

  @Post('login')
  @HttpCode(200)
  async userLogin(
    @Body() userDetails: UserLoginDto,
    @Req() _req: any,
    @Res() res: any,
  ): Promise<any> {
    try {
      const response: any = await this.userService.login(userDetails);
      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      delete response.refreshToken;
      delete response.password;
      return res.json({ success: true, ...response });
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException((error as Error).message, status);
    }
  }

  @Get('generate-captcha')
  async generateCaptcha(): Promise<{ captchaId: string; svg: string }> {
    return this.publicService.generateDefaultCaptcha();
  }

  @Post('validate-captcha')
  async validateCaptcha(
    @Body() validateCaptchaDto: ValidateCaptchaDto,
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.publicService.validateCaptcha(
      validateCaptchaDto.captchaId,
      validateCaptchaDto.captchaText,
    );
    return { isValid };
  }

  @Post('roles/seed')
  @HttpCode(201)
  async seedRoles(): Promise<{ message: string; created: number }> {
    const codes = Object.keys(ROLE_DISPLAY_NAMES) as RoleCode[];
    let created = 0;
    for (const code of codes) {
      try {
        await this.roleService.create({
          code,
          name: ROLE_DISPLAY_NAMES[code],
        });
        created++;
      } catch (e: any) {
        if (e?.status !== 409) throw e;
      }
    }
    return {
      message: created
        ? `Inserted ${created} role(s).`
        : 'All roles already exist.',
      created,
    };
  }

  @Get('logout')
  @HttpCode(200)
  async userLogout(
    @Req() req: any,
    @Res() res: any,
    @Query('loginId') loginId: string,
    @Query('hId') hId: string,
  ): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      let bearerToken: string | null = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        bearerToken = authHeader.substring(7);
      }
      const result = await this.userService.logout(
        bearerToken,
        this.cachingUtil,
        loginId,
        hId ? parseInt(hId, 10) : undefined,
      );
      return res.json(result);
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException((error as Error).message, status);
    }
  }
}

