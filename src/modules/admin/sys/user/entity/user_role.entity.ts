import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../share/entity/base.entity';

@Entity({ name: 'sys_user_role' })
export default class SysUserRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'role_id' })
  roleId: number;
}
