import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { PropertyEntity } from '../../property/model/property.entity';
import { PointEntity } from './point.entity';
import { LangEntity } from '../../lang/model/lang.entity';
import { CommonStringEntity } from '../../common/model/common-string.entity';

@Entity('directory-point2string')
export class Point2stringEntity
  extends BaseEntity
  implements CommonStringEntity<PointEntity> {

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

  @Column()
  string: string;

  @ManyToOne(
    () => PointEntity,
    directory => directory.string,
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

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity;

}