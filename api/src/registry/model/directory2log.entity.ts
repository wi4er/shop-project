import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn, Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DirectoryEntity } from './directory.entity';
import { CommonLogEntity } from '../../common/model/common-log.entity';

@Entity('registry-directory2log')
export class Directory2logEntity
  extends BaseEntity
  implements CommonLogEntity<DirectoryEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @ManyToOne(
    type => DirectoryEntity,
    directory => directory.log,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

  @Column()
  field: string;

  @Column()
  operation: string;

  @Column()
  from: string;

  @Column()
  to: string;

}