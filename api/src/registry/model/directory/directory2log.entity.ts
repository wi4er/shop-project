import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DirectoryEntity } from './directory.entity';
import { CommonLogEntity } from '../../../common/model/common/common-log.entity';

@Entity('registry-directory2log')
export class Directory2logEntity
  extends BaseEntity
  implements CommonLogEntity<DirectoryEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  version: number;

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
  value: string;

  @Column()
  from: string;

  @Column()
  to: string;

}