import {
  Controller,
  Inject,
  Provide,
  Post,
  Body,
  ALL,
  Get,
  Query,
} from '@midwayjs/core';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { AdminSysUserService } from './user.service';
import { AdminSysMenuService } from '../menu/menu.service';
import {
  CreateUserDto,
  DeleteUserDto,
  InfoUserDto,
  PasswordUserDto,
  QueryUserDto,
  UpdateUserDto,
} from './user.dto';
import { Validate } from '@midwayjs/validate';
import { ResOp } from '../../../../interface';
import { res, resByPage } from '../../../../utils';

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

  @Post('/add')
  @Validate()
  async add(@Body(ALL) dto: CreateUserDto): Promise<ResOp> {
    const result = await this.adminSysUserService.add(dto);
    if (!result) {
      return res({ code: 10001 });
    }
    return res();
  }

  @Get('/info')
  @Validate()
  async info(@Query(ALL) dto: InfoUserDto): Promise<ResOp> {
    return res({
      data: await this.adminSysUserService.info(dto.userId),
    });
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) dto: DeleteUserDto): Promise<ResOp> {
    await this.adminSysUserService.delete(dto.userIds);
    await this.adminSysUserService.multiForbidden(dto.userIds);
    return res();
  }

  @Post('/page')
  @Validate()
  async page(@Body(ALL) dto: QueryUserDto): Promise<ResOp> {
    const list = await this.adminSysUserService.page(
      this.ctx.admin.uid,
      dto.departmentIds,
      dto.page - 1,
      dto.limit
    );
    const total = await this.adminSysUserService.count(
      this.ctx.admin.uid,
      dto.departmentIds
    );
    return resByPage(list, total, dto.page, dto.limit);
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) dto: UpdateUserDto): Promise<ResOp> {
    await this.adminSysUserService.update(dto);
    await this.adminSysMenuService.refreshPerms(dto.id);
    return res();
  }

  @Post('/password')
  @Validate()
  async password(@Body(ALL) dto: PasswordUserDto): Promise<ResOp> {
    await this.adminSysUserService.forceUpdatePassword(
      dto.userId,
      dto.password
    );
    return res();
  }
}
