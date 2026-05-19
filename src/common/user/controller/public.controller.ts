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
import { UserLoginDto, RegisterDto } from '../dto/userLogin.dto';
import { RoleCode, ROLE_DISPLAY_NAMES } from '../enums/roleCode.enum';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  @Post('forgot-password')
  async forgotPassword(@Body() body: { identifier: string }): Promise<{ message: string }> {
    return this.userService.forgotPassword(body.identifier);
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
}

