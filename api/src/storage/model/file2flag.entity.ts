import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';
import { FileEntity } from './file.entity';

@Entity('storage-file2flag')
@Index(['parent', 'flag'], {unique: true})
export class File2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FileEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(
    () => FileEntity,
    file => file.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FileEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}