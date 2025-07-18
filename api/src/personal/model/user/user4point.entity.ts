import {
  BaseEntity,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('personal-user4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class User4pointEntity
  extends BaseEntity
  implements CommonPointEntity<UserEntity> {

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
    type => UserEntity,
    user => user.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

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