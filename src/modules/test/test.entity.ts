import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('test_table')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
