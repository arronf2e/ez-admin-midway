import { Config, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../../share/service/base.service';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import SysUser from './entity/user.entity';
import { In, Not, Repository } from 'typeorm';
import SysDepartment from '../dept/dept.entity';
import SysUserRole from './entity/user_role.entity';
import { iConfigAesSecret } from '../../../../interface';
import { Utils } from '../../../../utils';
import { UpdatePersonInfoDto } from '../../verify';
import { findIndex, isEmpty } from 'lodash';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IPageSearchUserResult } from '../../interface';
import { UpdatePasswordDto } from '../../verity.dto';

@Provide()
export class AdminSysUserService extends BaseService {
  @InjectEntityModel(SysUser)
  user: Repository<SysUser>;

  @InjectEntityModel(SysDepartment)
  dept: Repository<SysDepartment>;

  @InjectEntityModel(SysUserRole)
  userRole: Repository<SysUserRole>;

  @Inject()
  dataSourceManager: TypeORMDataSourceManager;

  @Config('aesSecret')
  aesSecret: iConfigAesSecret;

  @Config('rootRoleId')
  rootRoleId: number;

  @Inject()
  utils: Utils;

  /**
   * 查询用户个人信息
   */
  async getUserInfo(uid: number): Promise<SysUser | undefined> {
    const user = await this.user.findOne({
      where: {
        id: uid,
      },
    });
    return user;
  }

  /**
   * 更新个人信息
   */
  async updateUserInfo(
    uid: number,
    param: UpdatePersonInfoDto
  ): Promise<boolean> {
    const {
      name,
      nickName,
      email,
      phone,
      originPassword,
      newPassword,
      remark,
      headImg,
    } = param;
    let savePassword: string | undefined;
    if (originPassword && newPassword) {
      const user = await this.user.findOne({
        where: {
          id: uid,
        },
      });
      const comparePassword = this.utils.md5(`${originPassword}${user.psalt}`);
      if (user!.password === comparePassword) {
        savePassword = this.utils.md5(`${newPassword}${user.psalt}`);
      } else {
        // 旧密码不一致
        return false;
      }
    }
    const obj: any = { name, nickName, email, phone, remark, headImg };
    if (savePassword) {
      await this.upgradePasswordV(uid);
      obj.password = savePassword;
    }
    await this.user.update(uid, obj);
    return true;
  }

  /**
   * 更改管理员密码
   */
  async updatePassword(uid: number, dto: UpdatePasswordDto): Promise<boolean> {
    const user = await this.user.findOne({
      where: {
        id: uid,
      },
    });
    if (isEmpty(user)) {
      throw new Error('update password user is not exist');
    }
    const comparePassword = this.utils.md5(
      `${dto.originPassword}${user.psalt}`
    );
    // 原密码不一致，不允许更改
    if (user.password !== comparePassword) {
      return false;
    }
    const password = this.utils.md5(`${dto.newPassword}${user.psalt}`);
    await this.user.update({ id: uid }, { password });
    await this.upgradePasswordV(user.id);
    return true;
  }

  /**
   * 增加系统用户，如果返回false则表示已存在该用户
   * @param param Object 对应SysUser实体类
   */
  async add(param: CreateUserDto): Promise<boolean> {
    const exists = await this.user.findOne({
      where: {
        username: param.username,
      },
    });
    if (!isEmpty(exists)) {
      return false;
    }
    // 所有用户初始密码为123456
    const dataSource = this.getManager();
    await dataSource.transaction(async manager => {
      const salt = this.utils.generateRandomValue(32);
      const password = this.utils.md5(`123456:${salt}`);
      const u = manager.create(SysUser, {
        departmentId: param.departmentId,
        username: param.username,
        password,
        name: param.name,
        nickName: param.nickName,
        email: param.email,
        phone: param.phone,
        remark: param.remark,
        status: param.status,
        psalt: salt,
      });
      const result = await manager.save(u);
      const { roles } = param;
      const insertRoles = roles.map(e => {
        return {
          roleId: e,
          userId: result.id,
        };
      });
      // 分配角色
      await manager.insert(SysUserRole, insertRoles);
    });
    return true;
  }

  /**
   * 更新用户信息
   */
  async update(param: UpdateUserDto): Promise<void> {
    const dataSource = this.getManager();
    await dataSource.transaction(async manager => {
      await manager.update(SysUser, param.id, {
        departmentId: param.departmentId,
        username: param.username,
        name: param.name,
        nickName: param.nickName,
        email: param.email,
        phone: param.phone,
        remark: param.remark,
        status: param.status,
      });
      // 先删除原来的角色关系
      await manager.delete(SysUserRole, { userId: param.id });
      const insertRoles = param.roles.map(e => {
        return {
          roleId: e,
          userId: param.id,
        };
      });
      // 重新分配角色
      await manager.insert(SysUserRole, insertRoles);
      if (param.status === 0) {
        // 禁用状态
        await this.forbidden(param.id);
      }
    });
  }

  /**
   * 查找用户信息
   * @param id 用户id
   */
  async info(
    id: number
  ): Promise<(SysUser & { roles: number[]; departmentName: string }) | never> {
    const user: any = await this.user.findOne({
      where: {
        id,
      },
    });
    if (isEmpty(user)) {
      throw new Error('unfind this user info');
    }
    const departmentRow = await this.dept.findOne({
      where: {
        id: user!.departmentId,
      },
    });
    if (isEmpty(departmentRow)) {
      throw new Error('unfind this user info');
    }
    const roleRows = await this.userRole.find({
      where: {
        userId: user!.id,
      },
    });
    const roles = roleRows.map(e => {
      return e.roleId;
    });
    delete user!.password;
    return { ...user, roles, departmentName: departmentRow!.name };
  }

  /**
   * 查找列表里的信息
   */
  async infoList(ids: number[]): Promise<SysUser[]> {
    const users = await this.user.findByIds(ids);
    return users;
  }

  /**
   * 根据ID列表删除用户
   */
  async delete(userIds: number[]): Promise<void> {
    await this.user.delete(userIds);
    await this.userRole.delete({ userId: In(userIds) });
  }

  /**
   * 根据部门ID列举用户条数：除去超级管理员
   */
  async count(uid: number, deptIds: number[]): Promise<number> {
    const queryAll: boolean = isEmpty(deptIds);
    const rootUserId = await this.findRootUserId();
    if (queryAll) {
      return await this.user.count({
        where: {
          id: Not(In([rootUserId, uid])),
        },
      });
    }
    return await this.user.count({
      where: {
        id: Not(In([rootUserId, uid])),
        departmentId: In(deptIds),
      },
    });
  }

  /**
   * 根据部门ID进行分页查询用户列表
   * deptId = -1 时查询全部
   */
  async page(
    uid: number,
    deptIds: number[],
    page: number,
    count: number
  ): Promise<IPageSearchUserResult[]> {
    const queryAll: boolean = isEmpty(deptIds);
    const rootUserId = await this.findRootUserId();
    const result = await this.user
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'sys_department',
        'dept',
        'dept.id = user.departmentId'
      )
      .innerJoinAndSelect(
        'sys_user_role',
        'user_role',
        'user_role.user_id = user.id'
      )
      .innerJoinAndSelect('sys_role', 'role', 'role.id = user_role.role_id')
      .where('user.id NOT IN (:...ids)', { ids: [rootUserId, uid] })
      .andWhere(queryAll ? '1 = 1' : 'user.departmentId IN (:...deptIds)', {
        deptIds,
      })
      .offset(page * count)
      .limit(count)
      .getRawMany();
    const dealResult: IPageSearchUserResult[] = [];
    // 过滤去重
    result.forEach(e => {
      const index = findIndex(dealResult, e2 => e2.id === e.user_id);
      if (index < 0) {
        // 当前元素不存在则插入
        dealResult.push({
          createTime: e.user_createTime,
          departmentId: e.user_department_id,
          email: e.user_email,
          headImg: e.user_head_img,
          id: e.user_id,
          name: e.user_name,
          nickName: e.user_nick_name,
          phone: e.user_phone,
          remark: e.user_remark,
          status: e.user_status,
          updateTime: e.user_updateTime,
          username: e.user_username,
          departmentName: e.dept_name,
          roleNames: [e.role_name],
        });
      } else {
        // 已存在
        dealResult[index].roleNames.push(e.role_name);
      }
    });
    return dealResult;
  }

  /**
   * 禁用用户
   */
  async forbidden(uid: number): Promise<void> {
    await this.redis.del(`admin:passwordVersion:${uid}`);
    await this.redis.del(`admin:token:${uid}`);
    await this.redis.del(`admin:perms:${uid}`);
  }

  /**
   * 禁用多个用户
   */
  async multiForbidden(uids: number[]): Promise<void> {
    if (uids) {
      const pvs: string[] = [];
      const ts: string[] = [];
      const ps: string[] = [];
      uids.forEach(e => {
        pvs.push(`admin:passwordVersion:${e}`);
        ts.push(`admin:token:${e}`);
        ps.push(`admin:perms:${e}`);
      });
      await this.redis.del(pvs);
      await this.redis.del(ts);
      await this.redis.del(ps);
    }
  }

  /**
   * 查找超管的用户ID
   */
  async findRootUserId(): Promise<number> {
    const result = await this.userRole.findOne({
      where: {
        id: this.rootRoleId,
      },
    });
    return result.userId;
  }

  /**
   * 直接更改管理员密码
   */
  async forceUpdatePassword(uid: number, password: string): Promise<void> {
    const user = await this.user.findOne({
      where: {
        id: uid,
      },
    });
    if (isEmpty(user)) {
      throw new Error('update password user is not exist');
    }
    const newPassword = this.utils.md5(`${password}${user.psalt}`);
    await this.user.update({ id: uid }, { password: newPassword });
    await this.upgradePasswordV(user.id);
  }

  /**
   * 升级用户版本密码
   */
  async upgradePasswordV(id: number): Promise<void> {
    // admin:passwordVersion:${param.id}
    const v = await this.redis.get(`admin:passwordVersion:${id}`);
    if (!isEmpty(v)) {
      await this.redis.set(`admin:passwordVersion:${id}`, parseInt(v!) + 1);
    }
  }
}
