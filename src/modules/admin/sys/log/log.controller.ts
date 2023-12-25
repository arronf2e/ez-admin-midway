import { Provide, Controller, Inject, ALL, Get, Query } from '@midwayjs/core';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { AdminSysLoginLogService } from './service/login_log.service';
import { AdminSysTaskLogService } from './service/task_log.service';
import { AdminSysReqLogService } from './service/req_log.service';
import { ResOp } from '../../../../interface';
import { resByPage } from '../../../../utils';
import { Validate } from '@midwayjs/validate';
import { PageGetDto, SearchReqLogDto } from '../../../share/dto/base.dto';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/log`, {
  tagName: 'AdminSysLog',
  description: '后台日志控制器',
})
export class AdminSysLogController extends BaseController {
  @Inject()
  adminSysLoginLogService: AdminSysLoginLogService;

  @Inject()
  adminSysReqLogService: AdminSysReqLogService;

  @Inject()
  adminSysTaskLogService: AdminSysTaskLogService;

  @Get('/login/page')
  @Validate()
  async loginPage(@Query(ALL) dto: PageGetDto): Promise<ResOp> {
    const list = await this.adminSysLoginLogService.page(
      dto.page - 1,
      dto.limit
    );
    const count = await this.adminSysLoginLogService.count();
    return resByPage(list, count, dto.page, dto.limit);
  }

  @Get('/req/page')
  @Validate()
  async reqPage(@Query(ALL) dto: PageGetDto): Promise<ResOp> {
    const list = await this.adminSysReqLogService.page(dto.page - 1, dto.limit);
    const count = await this.adminSysReqLogService.count();
    return resByPage(list, count, dto.page, dto.limit);
  }

  @Get('/req/search')
  @Validate()
  async reqSearch(@Query(ALL) dto: SearchReqLogDto): Promise<ResOp> {
    const result = await this.adminSysReqLogService.search(
      dto.page,
      dto.limit,
      dto.q
    );
    return resByPage(result.logs, result.count, dto.page, dto.limit);
  }

  @Get('/task/page')
  @Validate()
  async taskPage(@Query(ALL) dto: PageGetDto): Promise<ResOp> {
    const list = await this.adminSysTaskLogService.page(
      dto.page - 1,
      dto.limit
    );
    const count = await this.adminSysTaskLogService.count();
    return resByPage(list, count, dto.page, dto.limit);
  }
}
