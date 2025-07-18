import {
  BaseEntity,
  Column,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-element4counter')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Element4counterEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
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
    element => element.counter,
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