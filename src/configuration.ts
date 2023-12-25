import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as swagger from '@midwayjs/swagger';
import * as dotenv from 'dotenv';
import * as orm from '@midwayjs/typeorm';
import * as redis from '@midwayjs/redis';
import * as bull from '@midwayjs/bull';
import * as bullBoard from '@midwayjs/bull-board';
import { join } from 'path';
import { ReportMiddleware } from './middleware/report.middleware';
import { ExecptionMiddleware } from './middleware/execption.middleware';

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
    this.app.useMiddleware([ReportMiddleware, ExecptionMiddleware]);
  }

  async onServerReady() {
    // 获取 Processor 相关的队列
    const testQueue = this.bullFramework.getQueue('SysTask');
    // 立即执行这个任务
    await testQueue?.runJob({
      name: 'hello world',
    });
  }
}
