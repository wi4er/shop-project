import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { CommonIntervalEntity } from '../../../common/model/common/common-interval.entity';

@Entity('content-element4interval')
export class Element4IntervalEntity
  extends BaseEntity
  implements CommonIntervalEntity<ElementEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: Date;

  @Column({nullable: true})
  to: Date | null;

  @ManyToOne(
    type => ElementEntity,
    element => element.string,
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