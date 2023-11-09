import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FlagEntity } from '../../flag/model/flag.entity';
import { PointEntity } from './point.entity';
import { CommonFlagEntity } from '../../common/model/common-flag.entity';

@Entity('directory-point2flag')
@Index(['parent', 'flag'], {unique: true})
export class Point2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<PointEntity> {

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
    () => PointEntity,
    lang => lang.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: PointEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}