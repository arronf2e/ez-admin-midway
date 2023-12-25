import {
  Provide,
  Controller,
  Inject,
  Get,
  Query,
  ALL,
  Post,
  Body,
} from '@midwayjs/core';
import { ResOp } from '../../../../interface';
import { res, resByPage } from '../../../../utils';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { AdminSysMenuService } from '../menu/menu.service';
import {
  DeleteRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  InfoRoleDto,
} from './role.dto';
import { AdminSysRoleService } from './role.service';
import { Validate } from '@midwayjs/validate';
import { PageGetDto } from '../../../share/dto/base.dto';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/role`, {
  tagName: 'AdminSysRole',
  description: '后台角色控制器',
})
export class AdminSysRoleController extends BaseController {
  @Inject()
  adminSysRoleService: AdminSysRoleService;

  @Inject()
  adminSysMenuService: AdminSysMenuService;

  @Get('/list')
  async list(): Promise<ResOp> {
    return res({
      data: await this.adminSysRoleService.list(),
    });
  }

  @Get('/page')
  @Validate()
  async page(@Query(ALL) dto: PageGetDto): Promise<ResOp> {
    const list = await this.adminSysRoleService.page(dto.page - 1, dto.limit);
    const count = await this.adminSysRoleService.count();
    return resByPage(list, count, dto.page, dto.limit);
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) dto: DeleteRoleDto): Promise<ResOp> {
    const count = await this.adminSysRoleService.countUserIdByRole(dto.roleIds);
    if (count > 0) {
      return res({ code: 10008 });
    }
    await this.adminSysRoleService.role.delete(dto.roleIds);
    await this.adminSysMenuService.refreshOnlineUserPerms();
    return res();
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) dto: CreateRoleDto): Promise<ResOp> {
    await this.adminSysRoleService.add(dto, this.ctx.admin.uid);
    return res();
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) dto: UpdateRoleDto): Promise<ResOp> {
    await this.adminSysRoleService.update(dto);
    await this.adminSysMenuService.refreshOnlineUserPerms();
    return res();
  }

  @Get('/info')
  @Validate()
  async info(@Query(ALL) dto: InfoRoleDto): Promise<ResOp> {
    return res({
      data: await this.adminSysRoleService.info(dto.roleId),
    });
  }
}
