import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { SectionEntity } from './section.entity';
import { CommonFlagEntity } from '../../../common/model/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag.entity';

@Entity('content-section2flag')
@Index(['parent', 'flag'], {unique: true})
export class Section2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<SectionEntity> {

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
    () => SectionEntity,
    section => section.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: SectionEntity;

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