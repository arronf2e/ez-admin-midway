import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/entity/base.entity';

@Entity({ name: 'image_space_info' })
export default class ImageSpaceInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column()
  extra: string;
}
