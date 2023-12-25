import {
  Provide,
  Controller,
  Inject,
  Config,
  Get,
  Post,
  Body,
  ALL,
} from '@midwayjs/core';
import { ResOp } from '../../../../interface';
import { res } from '../../../../utils';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { AdminSysUserService } from '../user/user.service';
import { KickDto } from './online.dto';
import { AdminSysOnlineService } from './online.service';
import { Validate } from '@midwayjs/validate';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/online`, {
  tagName: 'AdminSysOnline',
  description: '后台在线用户控制器',
})
export class AdminSysOnlineController extends BaseController {
  @Inject()
  adminSysOnlineService: AdminSysOnlineService;

  @Inject()
  adminSysUserService: AdminSysUserService;

  @Config('rootRoleId')
  rootRoleId: number;

  @Get('/list')
  async list(): Promise<ResOp> {
    return res({
      data: await this.adminSysOnlineService.list(),
    });
  }

  @Post('/kick')
  @Validate()
  async kick(@Body(ALL) dto: KickDto): Promise<ResOp> {
    if (dto.id === this.ctx.admin.uid) {
      return res({ code: 10012 });
    }
    const rootUserId = await this.adminSysUserService.findRootUserId();
    if (dto.id === rootUserId) {
      return res({ code: 10013 });
    }
    await this.adminSysUserService.forbidden(dto.id);
    return res();
  }
}
