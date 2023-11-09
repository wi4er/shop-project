import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonPointEntity } from '../../common/model/common-point.entity';
import { PointEntity } from './point.entity';
import { PropertyEntity } from '../../property/model/property.entity';

@Entity('directory-point2point')
@Index(['point', 'property', 'parent'], {unique: true})
export class Point2pointEntity
  extends BaseEntity
  implements CommonPointEntity<PointEntity> {

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
    () => PointEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  point: PointEntity;

  @ManyToOne(
    () => PointEntity,
    point => point.point,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: PointEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

}