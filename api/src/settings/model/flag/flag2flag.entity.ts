import {
  BaseEntity,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FlagEntity } from './flag.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';

@Entity('settings-flag2flag')
@Index(['parent', 'flag'], {unique: true})
export class Flag2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FlagEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @ManyToOne(
    () => FlagEntity,
    flag => flag.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FlagEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}