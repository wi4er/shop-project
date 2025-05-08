import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CommonLogEntity } from '../../common/model/common-log.entity';
import { PointEntity } from './point.entity';

@Entity('registry-pont2log')
export class Point2logEntity
  extends BaseEntity
  implements CommonLogEntity<PointEntity> {

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
    type => PointEntity,
    point => point.log,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: PointEntity;

  @Column()
  field: string;

  @Column()
  operation: string;

  @Column()
  from: string;

  @Column()
  to: string;

}