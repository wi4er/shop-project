import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { SectionEntity } from './section.entity';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-section4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Section4pointEntity
  extends BaseEntity
  implements CommonPointEntity<SectionEntity> {

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
    type => SectionEntity,
    element => element.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: SectionEntity;

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