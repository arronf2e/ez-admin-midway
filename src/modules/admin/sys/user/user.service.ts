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
import { isEmpty } from 'lodash';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IPageSearchUserResult } from '../interface';

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
      const decodePassword = this.utils.aesDecrypt(
        user!.password,
        this.aesSecret.admin
      );
      const decodeOriginPassword = this.utils.aesDecrypt(
        originPassword,
        this.aesSecret.front
      );
      const decodeNewPassword = this.utils.aesDecrypt(
        newPassword,
        this.aesSecret.front
      );
      if (decodePassword === decodeOriginPassword) {
        // 旧密码不一致
        savePassword = this.utils.aesEncrypt(
          decodeNewPassword,
          this.aesSecret.admin
        );
      } else {
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
    const dataSource = this.dataSourceManager.getDataSource('default');
    await dataSource.transaction(async manager => {
      const password = this.utils.aesEncrypt('123456', this.aesSecret.admin);
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
    const dataSource = this.dataSourceManager.getDataSource('default');
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
  async delete(userIds: number[]) {
    await this.user.delete(userIds);
    await this.userRole.delete({ userId: In(userIds) });
  }

  /**
   * 根据部门ID列举用户条数：除去超级管理员
   */
  async count(uid: number, deptId: number): Promise<number> {
    if (deptId === -1) {
      return await this.user.count({
        where: {
          id: Not(In([this.rootRoleId, uid])),
        },
      });
    }
    return await this.user.count({
      where: {
        id: Not(In([this.rootRoleId, uid])),
        departmentId: deptId,
      },
    });
  }

  /**
   * 根据部门ID进行分页查询用户列表
   * deptId = -1 时查询全部
   */
  async page(
    uid: number,
    deptId: number,
    page: number,
    count: number
  ): Promise<IPageSearchUserResult[]> {
    const result = await this.user
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'sys_department',
        'dept',
        'dept.id = user.departmentId'
      )
      .where('user.id NOT IN (:...ids)', { ids: [this.rootRoleId, uid] })
      .andWhere(deptId === -1 ? '1 = 1' : `user.departmentId = '${deptId}'`)
      .offset(page * count)
      .limit(count)
      .getRawMany();
    const dealResult = result.map(e => {
      return {
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
      };
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
