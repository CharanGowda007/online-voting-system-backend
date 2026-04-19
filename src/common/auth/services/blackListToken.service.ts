import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CachingUtil } from 'src/common/core/utils/caching.util';
import { BlackListedTokens } from '../models/blackListTokens.model';

@Injectable()
export class BlackListTokenService {
  private readonly logger = new Logger(BlackListTokenService.name);

  constructor(
    private cachingUtil: CachingUtil,
    @InjectRepository(BlackListedTokens)
    private blackListedTokensRepository: Repository<BlackListedTokens>,
  ) {}

  async blacklistToken(
    token: string,
    expiresIn: number,
    namespace = 'blacklist',
  ): Promise<BlackListedTokens> {
    this.logger.log('calling token blacklisting method ---------------->');
    try {
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      const cacheKey = `${namespace}:${token}`;
      await this.cachingUtil.setCache(cacheKey, token, expiresIn);
      const blackListedToken = new BlackListedTokens();
      blackListedToken.token = token;
      blackListedToken.expiresAt = expiresAt;
      const newBlacklistedToken =
        this.blackListedTokensRepository.create(blackListedToken);
      await this.blackListedTokensRepository.save(newBlacklistedToken);
      this.logger.log(
        `Token blacklisted successfully with ID: ${newBlacklistedToken.id}`,
      );
      return newBlacklistedToken;
    } catch (error) {
      this.logger.error('unable to blacklist token ---------------->', error);
      throw new Error((error as Error).message);
    }
  }

  async isTokenBlacklisted(
    token: string,
    namespace = 'blacklist',
  ): Promise<boolean> {
    try {
      this.logger.log(
        'checking whether token is blacklisted or not ---------------->',
      );
      const cacheKey = `${namespace}:${token}`;
      const result = await this.cachingUtil.getCache(cacheKey);
      if (result) return true;
      const tokenEntry = await this.blackListedTokensRepository
        .createQueryBuilder('bts')
        .where('bts.token = :token', { token })
        .andWhere('bts.expiresAt > :now', { now: new Date() })
        .getOne();
      return !!tokenEntry;
    } catch (error) {
      this.logger.error(
        'unable to check whether token is blacklisted or not ---------------->',
        error,
      );
      throw new Error((error as Error).message);
    }
  }

  async syncBlacklistWithRedis(_namespace: string): Promise<void> {
    this.logger.log(
      'syncing blacklisted tokens from db to redis -------------------->',
    );
    try {
      const blacklistedTokens = await this.blackListedTokensRepository.find();
      for (const token of blacklistedTokens) {
        const ttl = Math.floor(
          (new Date(token.expiresAt).getTime() - Date.now()) / 1000,
        );
        if (ttl > 0) {
          await this.cachingUtil.setCache(
            token.token,
            JSON.stringify(token),
            ttl,
          );
        }
      }
      this.logger.log(
        `Successfully synced ${blacklistedTokens.length} blacklisted tokens to redis`,
      );
    } catch (error) {
      const err = error as Error;
      if (err.message?.includes('EntityMetadataNotFoundError')) {
        this.logger.warn(
          'BlackListedTokens entity metadata not ready yet, skipping sync.',
        );
      } else {
        this.logger.warn(
          'unable to sync blacklisted tokens from db to redis ----------------->',
          err.message,
        );
      }
    }
  }
}
