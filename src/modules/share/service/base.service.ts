import { Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

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
