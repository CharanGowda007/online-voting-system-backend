import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CachingUtil {
  private readonly logger = new Logger(CachingUtil.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCache<Output>(key: string): Promise<Output | undefined> {
    return this.cacheManager.get<Output>(key);
  }

  async setCache(key: string, value: unknown, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async setCacheInfinite(key: string, value: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, 180);
    } catch (error) {
      this.logger.error(
        `Error setting cache for key: ${key}, value: ${value}`,
        error,
      );
    }
  }

  async deleteCache(key: string): Promise<void> {
    this.logger.log(' deleteCache : key : ' + key);
    await this.cacheManager.del(key);
  }

  async clearFullCache(): Promise<void> {
    this.logger.log(' clearFullCache');
    await (this.cacheManager as any).reset();
  }
}
