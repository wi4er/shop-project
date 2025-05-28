import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { PointEntity } from '../../../registry/model/point.entity';
import { CommonPointEntity } from '../../../common/model/common-point.entity';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

@Entity('content-block4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Block4pointEntity
  extends BaseEntity
  implements CommonPointEntity<BlockEntity> {

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
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  point: PointEntity;

  @ManyToOne(
    () => BlockEntity,
    block => block.point,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}