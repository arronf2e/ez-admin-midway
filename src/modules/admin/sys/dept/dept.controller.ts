import { ALL, Body, Get, Inject, Post, Provide, Query } from '@midwayjs/core';
import { BaseController } from '../../../share/controller/base.controller';
import { AdminSysDeptService } from './dept.service';
import { ResOp } from '../../../../interface';
import { res } from '../../../../utils';
import { Validate } from '@midwayjs/validate';
import { CreateDeptDto, DeleteDeptDto, InfoDeptDto, MoveDeptDto, TransferDeptDto, UpdateDeptDto } from './dept.dto';

@Provide()
export class AdminSysDeptController extends BaseController {
  @Inject()
  adminSysDeptService: AdminSysDeptService;

  @Get('/list')
  async list(): Promise<ResOp> {
    return res({
      data: await this.adminSysDeptService.getDepts(this.ctx.admin.uid),
    });
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) createDeptDto: CreateDeptDto): Promise<ResOp> {
    await this.adminSysDeptService.add(
      createDeptDto.name,
      createDeptDto.parentId
    );
    return res();
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) deleteDeptDto: DeleteDeptDto): Promise<ResOp> {
    // 查询是否有关联用户或者部门，如果含有则无法删除
    const count = await this.adminSysDeptService.countUserByDeptId(
      deleteDeptDto.departmentId
    );
    if (count > 0) {
      return res({ code: 10009 });
    }
    const count2 = await this.adminSysDeptService.countRoleByDeptId(
      deleteDeptDto.departmentId
    );
    if (count2 > 0) {
      return res({ code: 10010 });
    }
    const count3 = await this.adminSysDeptService.countChildDept(
      deleteDeptDto.departmentId
    );
    if (count3 > 0) {
      return res({ code: 10015 });
    }
    await this.adminSysDeptService.delete(deleteDeptDto.departmentId);
    return res();
  }

  @Get('/info')
  @Validate()
  async info(@Query(ALL) infoDeptDto: InfoDeptDto): Promise<ResOp> {
    return res({
      data: await this.adminSysDeptService.info(infoDeptDto.departmentId),
    });
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) updateDeptDto: UpdateDeptDto): Promise<ResOp> {
    await this.adminSysDeptService.update(updateDeptDto);
    return res();
  }

  @Post('/transfer')
  @Validate()
  async transfer(@Body(ALL) transferDeptDto: TransferDeptDto): Promise<ResOp> {
    await this.adminSysDeptService.transfer(
      transferDeptDto.userIds,
      transferDeptDto.departmentId
    );
    return res();
  }

  @Post('/move')
  @Validate()
  async move(@Body(ALL) dto: MoveDeptDto): Promise<ResOp> {
    await this.adminSysDeptService.move(dto.depts);
    return res();
  }
}
