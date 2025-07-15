import {
  BaseEntity,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { PointEntity } from './point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('registry-point4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Point4pointEntity
  extends BaseEntity
  implements CommonPointEntity<PointEntity> {

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
    type => PointEntity,
    point => point.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: PointEntity;

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