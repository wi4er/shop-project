import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point.entity';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

@Entity('content-element4counter')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Element4CounterEntity {

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
  count: number;

  @ManyToOne(
    type => PointEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  point: PointEntity;

  @ManyToOne(
    type => ElementEntity,
    element => element.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}