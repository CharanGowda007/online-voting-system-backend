import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entity/user.entity';
import { ICaptchaResponse } from '../interface/captcha.interface';

@Injectable()
export class PublicService {
  private readonly CAPTCHA_EXPIRY_TIME = 5 * 60 * 1000;
  private readonly CAPTCHA_KEY_PREFIX = 'captcha:';
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private getCaptchaKey(captchaId: string): string {
    return `${this.CAPTCHA_KEY_PREFIX}${captchaId}`;
  }

  private generateNoisyLines(count: number): string {
    let lines = '';
    for (let i = 0; i < count; i++) {
      const x1 = Math.random() * 150;
      const y1 = Math.random() * 50;
      const x2 = Math.random() * 150;
      const y2 = Math.random() * 50;
      lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#808080" stroke-width="0.5" opacity="0.5"/>`;
    }
    return lines;
  }

  private generateNoisyDots(count: number): string {
    let dots = '';
    for (let i = 0; i < count; i++) {
      const cx = Math.random() * 150;
      const cy = Math.random() * 50;
      dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="#808080" opacity="0.5"/>`;
    }
    return dots;
  }

  async generateDefaultCaptcha(): Promise<ICaptchaResponse> {
    const defaultCaptchaText = Array(6)
      .fill(0)
      .map(() => {
        const choices = [
          () => Math.floor(Math.random() * 10).toString(),
          () => String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          () => String.fromCharCode(97 + Math.floor(Math.random() * 26)),
        ];
        return choices[Math.floor(Math.random() * choices.length)]();
      })
      .join('');
    const captchaId = this.generateUniqueId();
    const captchaKey = this.getCaptchaKey(captchaId);
    await this.cacheManager.set(
      captchaKey,
      defaultCaptchaText,
      this.CAPTCHA_EXPIRY_TIME,
    );
    const defaultSvg = `
      <svg width="150" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#d0d0d0"/>
        ${this.generateNoisyLines(8)}
        <text x="50%" y="50%" dy=".3em" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" letter-spacing="2">${defaultCaptchaText}</text>
        ${this.generateNoisyDots(20)}
      </svg>
    `;
    return { captchaId, svg: defaultSvg };
  }

  async validateCaptcha(
    captchaId: string,
    userInput: string,
  ): Promise<boolean> {
    try {
      const captchaKey = this.getCaptchaKey(captchaId);
      const storedCaptchaText = await this.cacheManager.get<string>(captchaKey);
      if (!storedCaptchaText) return false;
      const isValid =
        storedCaptchaText.toLowerCase() === userInput.toLowerCase();
      await this.cacheManager.del(captchaKey);
      return isValid;
    } catch (error) {
      this.logger.error(
        `Error validating captcha: ${(error as Error).message}`,
      );
      return false;
    }
  }
}

