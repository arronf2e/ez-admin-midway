import { Configuration, App, Inject, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as swagger from '@midwayjs/swagger';
import * as dotenv from 'dotenv';
import * as orm from '@midwayjs/typeorm';
import * as redis from '@midwayjs/redis';
import * as bull from '@midwayjs/bull';
import * as bullBoard from '@midwayjs/bull-board';
import * as jwt from '@midwayjs/jwt';
import * as passport from '@midwayjs/passport';
import { join } from 'path';
import { ReportMiddleware } from './middleware/report.middleware';
import { ExecptionMiddleware } from './middleware/execption.middleware';
import { AdminSysTaskService } from './modules/admin/sys/task/task.service';
import { AdminAuthMiddleware } from './middleware/admin_auth.middleware';

dotenv.config();

@Configuration({
  imports: [
    koa,
    validate,
    swagger,
    orm,
    redis,
    bull,
    bullBoard,
    jwt,
    passport,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    // add middleware
    this.app.useMiddleware([
      ReportMiddleware,
      ExecptionMiddleware,
      AdminAuthMiddleware,
    ]);
  }

  async onServerReady(container: IMidwayContainer) {
    // 初始化系统任务
    const taskService = await container.getAsync(AdminSysTaskService);
    await taskService.initTask();
  }
}
