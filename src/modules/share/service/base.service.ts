import { Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

/**
 * BaseService
 */
export class BaseService {
  @Inject()
  redis: RedisService;

  getAdminRedis(): Promise<string> {
    return this.redis.get('admin');
  }
}
