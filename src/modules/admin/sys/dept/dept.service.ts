import { Config, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../../share/service/base.service';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import SysRoleDepartment from '../role/entity/role_dept.entity';
import { AdminSysRoleService } from '../role/role.service';
import SysUser from '../user/entity/user.entity';
import SysDepartment from './dept.entity';
import { IInfoDeptResult } from '../../interface';
import { MoveDept, UpdateDeptDto } from './dept.dto';
import { includes } from 'lodash';

@Provide()
export class AdminSysDeptService extends BaseService {
  @InjectEntityModel(SysDepartment)
  dept: Repository<SysDepartment>;

  @InjectEntityModel(SysRoleDepartment)
  roleDept: Repository<SysRoleDepartment>;

  @Inject()
  adminSysRoleService: AdminSysRoleService;

  @InjectEntityModel(SysUser)
  user: Repository<SysUser>;

  @Config('rootRoleId')
  rootRoleId: number;

  /**
   * 获取所有部门
   */
  async list(): Promise<SysDepartment[]> {
    return await this.dept.find();
  }

  /**
   * 根据ID查找部门信息
   */
  async info(id: number): Promise<IInfoDeptResult> {
    const department = await this.dept.findOne({
      where: {
        id,
      },
    });
    let parentDepartment: any = null;
    if (department!.parentId) {
      parentDepartment = await this.dept.findOne({
        where: {
          id: department!.parentId,
        },
      });
    }
    return { department, parentDepartment };
  }

  /**
   * 更新部门信息
   */
  async update(param: UpdateDeptDto): Promise<void> {
    await this.dept.update(param.id, {
      parentId: param.parentId === -1 ? undefined : param.parentId,
    });
  }

  /**
   * 转移部门
   */
  async transfer(userIds: number[], deptId: number): Promise<void> {
    await this.user.update({ id: In(userIds) }, { departmentId: deptId });
  }

  /**
   * 新增部门
   */
  async add(deptName: string, parentDeptId: number): Promise<void> {
    await this.dept.insert({
      name: deptName,
      parentId: parentDeptId === -1 ? undefined : parentDeptId,
    });
  }

  /**
   * 根据ID删除部门
   */
  async delete(departmentId: number): Promise<void> {
    await this.dept.delete(departmentId);
  }

  /**
   * 查找当前部门下的子部门数量
   */
  async countChildDept(id: number): Promise<number> {
    return await this.dept.count({
      where: {
        parentId: id,
      },
    });
  }

  /**
   * 根据部门查询关联的用户数量
   */
  async countUserByDeptId(id: number): Promise<number> {
    return await this.user.count({
      where: {
        departmentId: id,
      },
    });
  }

  /**
   * 根据部门查询关联的角色数量
   */
  async countRoleByDeptId(id: number): Promise<number> {
    return await this.roleDept.count({
      where: {
        departmentId: id,
      },
    });
  }

  /**
   * 根据当前角色id获取部门列表
   */
  async getDepts(uid: number): Promise<SysDepartment[]> {
    const roleIds = await this.adminSysRoleService.getRoleIdByUser(uid);
    let depts: any = [];
    if (includes(roleIds, this.rootRoleId)) {
      // root find all
      depts = await this.dept.find();
    } else {
      // [ 1, 2, 3 ] role find
      depts = await this.dept
        .createQueryBuilder('dept')
        .innerJoinAndSelect(
          'sys_role_department',
          'role_dept',
          'dept.id = role_dept.department_id'
        )
        .andWhere('role_dept.role_id IN (:...roldIds)', { roldIds: roleIds })
        .orderBy('dept.order_num', 'ASC')
        .getMany();
    }
    return depts;
  }

  /**
   * 移动排序
   */
  async move(depts: MoveDept[]): Promise<void> {
    await this.getManager().transaction(async manager => {
      for (let i = 0; i < depts.length; i++) {
        await manager.update(
          SysDepartment,
          { id: depts[i].id },
          { parentId: depts[i].parentId }
        );
      }
    });
  }
}
