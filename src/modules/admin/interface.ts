import SysDepartment from './sys/dept/dept.entity';
import SysMenu from './sys/menu/menu.entity';
import SysRole from './sys/role/entity/role.entity';
import SysRoleDepartment from './sys/role/entity/role_dept.entity';
import SysRoleMenu from './sys/role/entity/role_menu.entity';

export interface IImageCaptchaResult {
  img: string;
  id: string;
}

export interface IPermMenuResult {
  menus: SysMenu[];
  perms: string[];
}

export interface IMenuItemAndParentInfoResult {
  menu: SysMenu | undefined;
  parentMenu: SysMenu | undefined;
}

export interface ILoginLogResult {
  id: number;
  ip: string;
  os: string;
  browser: string;
  time: string;
  username: string;
}

export interface IRoleInfoResult {
  roleInfo: SysRole;
  menus: SysRoleMenu[];
  depts: SysRoleDepartment[];
}

export interface IAddRoleResult {
  roleId: number;
}

export interface IPageSearchUserResult {
  createTime: string;
  departmentId: number;
  email: string;
  headImg: string;
  id: number;
  name: string;
  nickName: string;
  phone: string;
  remark: string;
  status: number;
  updateTime: string;
  username: string;
  departmentName: string;
}

export interface IImageCaptchaOptions {
  width: number;
  height: number;
}

export interface IInfoDeptResult {
  department: SysDepartment | undefined;
  parentDepartment: SysDepartment | undefined;
}
