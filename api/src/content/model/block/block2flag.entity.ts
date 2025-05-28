import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { CommonFlagEntity } from '../../../common/model/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

@Entity('content-block2flag')
@Index([ 'parent', 'flag' ], { unique: true })
export class Block2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<BlockEntity> {

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
    () => BlockEntity,
    block => block.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

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