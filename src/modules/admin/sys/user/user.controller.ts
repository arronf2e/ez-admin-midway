import { Controller, Inject, Provide } from '@midwayjs/core';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { AdminSysUserService } from './user.service';
import { AdminSysMenuService } from '../menu/menu.service';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/user`, {
  tagName: 'AdminSysUser',
  description: '后台系统管理员控制器',
})
export class AdminSysUserController extends BaseController {
  @Inject()
  adminSysUserService: AdminSysUserService;

  @Inject()
  adminSysMenuService: AdminSysMenuService;
}
