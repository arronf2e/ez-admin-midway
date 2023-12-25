import { Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';

/**
 * BaseService
 */
export class BaseService {
  @Inject()
  redis: RedisService;

  @Inject()
  dataSourceManager: TypeORMDataSourceManager;

  getManager() {
    return this.dataSourceManager.getDataSource('default');
  }
}
