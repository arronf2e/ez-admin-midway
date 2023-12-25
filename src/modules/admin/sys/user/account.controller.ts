import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
} from '@midwayjs/core';
import {
  ADMIN_PREFIX_URL,
  BaseController,
  NOPERM_PREFIX_URL,
} from '../../../share/controller/base.controller';
import { AdminVerifyService } from '../../verify.service';
import { AdminSysUserService } from './user.service';
import { ResOp } from '../../../../interface';
import { res } from '../../../../utils';
import { Validate } from '@midwayjs/validate';
import { UpdatePersonInfoDto } from '../../verify';
import { UpdatePasswordDto } from '../../verity.dto';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}${NOPERM_PREFIX_URL}/account`, {
  tagName: 'AdminAccount',
  description: '后台账号信息控制器',
})
export class AdminAccountController extends BaseController {
  @Inject()
  adminSysUserService: AdminSysUserService;

  @Inject()
  adminVerifyService: AdminVerifyService;

  @Get('/info')
  async info(): Promise<ResOp> {
    return res({
      data: await this.adminSysUserService.getUserInfo(this.ctx.admin.uid),
    });
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) personInfo: UpdatePersonInfoDto): Promise<ResOp> {
    await this.adminSysUserService.updateUserInfo(
      this.ctx.admin.uid,
      personInfo
    );
    return res();
  }

  @Post('/password')
  @Validate()
  async password(@Body(ALL) dto: UpdatePasswordDto): Promise<ResOp> {
    const result = await this.adminSysUserService.updatePassword(
      this.ctx.admin.uid,
      dto
    );
    if (result) {
      return res();
    }
    return res({ code: 10011 });
  }

  @Post('/logout')
  async logout(): Promise<ResOp> {
    await this.adminVerifyService.clearLoginStatus(this.ctx.admin.uid);
    return res();
  }

  @Get('/permmenu')
  async permmenu(): Promise<ResOp> {
    return res({
      data: await this.adminVerifyService.getPermMenu(this.ctx.admin.uid),
    });
  }
}
