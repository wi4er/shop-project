import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../flag/flag.entity';

@Entity('settings-attribute2flag')
@Index(['parent', 'flag'], {unique: true})
export class Attribute2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<AttributeEntity> {

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
    () => AttributeEntity,
    attribute => attribute.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: AttributeEntity;

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