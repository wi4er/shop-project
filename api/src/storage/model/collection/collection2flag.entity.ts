import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { CollectionEntity } from './collection.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('storage-collection2flag')
@Index(['parent', 'flag'], {unique: true})
export class Collection2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<CollectionEntity> {

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
    () => CollectionEntity,
    file => file.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: CollectionEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}