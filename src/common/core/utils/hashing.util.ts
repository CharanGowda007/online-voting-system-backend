import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class HashingUtil {
  private readonly logger = new Logger(HashingUtil.name);

  async generateHashedPassword(): Promise<{
    hashedPassword: string;
    password: string;
  }> {
    try {
      const password = await this.generatePassword(16, '$#-');
      this.logger.debug(`Generated password: ${password}`);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return { hashedPassword, password };
    } catch (error) {
      this.logger.error(
        `Error hashing password: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new HttpException(
        'failed to hash the password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generatePassword(
    length = 12,
    customSpecialChars = '',
  ): Promise<string> {
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseLetters = lowercaseLetters.toUpperCase();
    const numbers = '0123456789';
    const specialCharacters =
      customSpecialChars || '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?';
    const allChars =
      lowercaseLetters + uppercaseLetters + numbers + specialCharacters;
    const categories: string[] = [
      lowercaseLetters,
      uppercaseLetters,
      numbers,
      specialCharacters.length > 0 ? specialCharacters : '',
    ].filter(Boolean);
    const chosenCategories = new Set<string>();
    while (chosenCategories.size < Math.min(4, categories.length)) {
      const randomIndex = Math.floor(randomBytes(1)[0] % categories.length);
      chosenCategories.add(categories[randomIndex]);
    }
    let password = '';
    for (const category of chosenCategories) {
      password += category[Math.floor(randomBytes(1)[0] % category.length)];
    }
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(randomBytes(1)[0] % allChars.length)];
    }
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(randomBytes(1)[0] % (i + 1));
      [passwordArray[i], passwordArray[j]] = [
        passwordArray[j],
        passwordArray[i],
      ];
    }
    return passwordArray.join('').slice(0, length);
  }
}
