import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1703165326687_8082',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        /**
         * 单数据库实例
         */
        type: 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'ez-admin-midwayjs',
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: true,
        // 或者扫描形式
        entities: ['**/**/*.entity{.ts,.js}'],
        migrationsTableName: 'custom_migration_table',
        migrations: ['sql/migration/*.js'],
        cli: {
          migrationsDir: 'migration',
        },
      },
    },
  },
  redis: {
    client: {
      port: process.env.REDIS_PORT || 6379, // Redis port
      host: process.env.REDIS_HOST || '127.0.0.1', // Redis host
    },
  },
} as MidwayConfig;