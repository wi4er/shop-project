import {
  BaseEntity,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { PointEntity } from '../point/point.entity';
import { DirectoryEntity } from './directory.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('registry-directory4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Directory4pointEntity
  extends BaseEntity
  implements CommonPointEntity<DirectoryEntity> {

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
    type => DirectoryEntity,
    directory => directory.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

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