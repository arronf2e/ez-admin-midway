import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../share/entity/base.entity';

@Entity({ name: 'sys_role_menu' })
export default class SysRoleMenu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'menu_id' })
  menuId: number;
}
