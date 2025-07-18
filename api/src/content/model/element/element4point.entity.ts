import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { ElementEntity } from './element.entity';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-element4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Element4pointEntity
  extends BaseEntity
  implements CommonPointEntity<ElementEntity> {

  @PrimaryGeneratedColumn()
  id: number;

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