import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/entity/base.entity';

@Entity({ name: 'image_space_type' })
export default class ImageSpaceType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;
}
