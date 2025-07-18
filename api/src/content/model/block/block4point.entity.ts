import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-block4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Block4pointEntity
  extends BaseEntity
  implements CommonPointEntity<BlockEntity> {

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
    type => BlockEntity,
    block => block.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

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