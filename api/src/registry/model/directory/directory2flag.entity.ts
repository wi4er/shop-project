import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { DirectoryEntity } from './directory.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('registry-directory2flag')
@Index(['parent', 'flag'], {unique: true})
export class Directory2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<DirectoryEntity> {

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
    type => DirectoryEntity,
    directory => directory.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

  @ManyToOne(
    type => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}