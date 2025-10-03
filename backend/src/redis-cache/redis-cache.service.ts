import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CustomLogger } from 'src/logger/custom-logger.service';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(RedisCacheService.name);
  }

  async get<T = any>(key: string) {
    let storedVal;
    try {
      storedVal = await this.cache.get(key);

      if (storedVal) {
        if (typeof storedVal === 'string') {
          return JSON.parse(storedVal) as T;
        }
        return storedVal as T;
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async set(key: string, value: any, ttl: string | number) {
    value = JSON.stringify(value);
    try {
      await this.cache.set(key, value, +ttl);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
    return;
  }

  async del(key: string) {
    try {
      await this.cache.del(key);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
    return;
  }
}
