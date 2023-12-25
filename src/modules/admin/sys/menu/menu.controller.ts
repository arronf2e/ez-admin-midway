import {
  Provide,
  Controller,
  Inject,
  Get,
  Post,
  Body,
  ALL,
  Query,
} from '@midwayjs/core';
import { isEmpty } from 'class-validator';
import { flattenDeep } from 'lodash';
import { ResOp } from '../../../../interface';
import { res } from '../../../../utils';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import {
  CreateMenuDto,
  UpdateMenuDto,
  DeleteMenuDto,
  InfoMenuDto,
} from './menu.dto';
import { AdminSysMenuService } from './menu.service';
import { Validate } from '@midwayjs/validate';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/menu`, {
  tagName: 'AdminSysMenu',
  description: '后台菜单控制器',
})
export class AdminSysMenuController extends BaseController {
  @Inject()
  adminSysMenuService: AdminSysMenuService;

  @Get('/list')
  async list(): Promise<ResOp> {
    return res({
      data: await this.adminSysMenuService.getMenus(this.ctx.admin.uid),
    });
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) dto: CreateMenuDto): Promise<ResOp> {
    if (dto.type === 2 && dto.parentId === -1) {
      // 无法直接创建权限，必须有ParentId
      return res({ code: 10005 });
    }
    if (dto.type === 1 && dto.parentId !== -1) {
      const parent = await this.adminSysMenuService.getMenuItemInfo(
        dto.parentId
      );
      if (isEmpty(parent)) {
        return res({ code: 10014 });
      }
      if (parent && parent.type === 1) {
        // 当前新增为菜单但父节点也为菜单时为非法操作
        return res({ code: 10006 });
      }
    }
    if (dto.parentId === -1) {
      dto.parentId = undefined;
    }
    await this.adminSysMenuService.save(dto);
    if (dto.type === 2) {
      // 如果是权限发生更改，则刷新所有在线用户的权限
      await this.adminSysMenuService.refreshOnlineUserPerms();
    }
    return res();
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) dto: UpdateMenuDto): Promise<ResOp> {
    if (dto.type === 2 && dto.parentId === -1) {
      // 无法直接创建权限，必须有ParentId
      return res({ code: 10005 });
    }
    if (dto.type === 1 && dto.parentId !== -1) {
      const parent = await this.adminSysMenuService.getMenuItemInfo(
        dto.parentId
      );
      if (isEmpty(parent)) {
        return res({ code: 10014 });
      }
      if (parent && parent.type === 1) {
        // 当前新增为菜单但父节点也为菜单时为非法操作
        return res({ code: 10006 });
      }
    }
    if (dto.parentId === -1) {
      dto.parentId = null;
    }
    const insertData: CreateMenuDto & { id: number } = {
      ...dto,
      id: dto.menuId,
    };
    await this.adminSysMenuService.save(insertData);
    if (dto.type === 2) {
      // 如果是权限发生更改，则刷新所有在线用户的权限
      await this.adminSysMenuService.refreshOnlineUserPerms();
    }
    return res();
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) dto: DeleteMenuDto): Promise<ResOp> {
    // 68为内置init.sql中插入最后的索引编号
    if (dto.menuId <= 68) {
      // 系统内置功能不提供删除
      return res({ code: 10016 });
    }
    // 如果有子目录，一并删除
    const childMenus = await this.adminSysMenuService.findChildMenus(
      dto.menuId
    );
    await this.adminSysMenuService.deleteMenuItem(
      flattenDeep([dto.menuId, childMenus])
    );
    // 刷新在线用户权限
    await this.adminSysMenuService.refreshOnlineUserPerms();
    return res();
  }

  @Get('/info')
  @Validate()
  async info(@Query(ALL) dto: InfoMenuDto): Promise<ResOp> {
    return res({
      data: await this.adminSysMenuService.getMenuItemAndParentInfo(dto.menuId),
    });
  }
}
