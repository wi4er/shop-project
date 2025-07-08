import { BaseEntity, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DocumentEntity } from './document.entity';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('bundle-document4point')
@Index(['parent', 'point', 'attribute'], {unique: true})
export class Document4pointEntity
  extends BaseEntity
  implements CommonPointEntity<DocumentEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DocumentEntity,
    document => document.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DocumentEntity;

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
    type => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}