import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as swagger from '@midwayjs/swagger';
import * as dotenv from 'dotenv';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
import { ReportMiddleware } from './middleware/report.middleware';

dotenv.config();

@Configuration({
  imports: [
    koa,
    validate,
    swagger,
    orm,
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

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
  }
}
