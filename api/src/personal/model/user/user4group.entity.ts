import {
  BaseEntity,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from '../group/group.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('personal-user4group')
export class User4groupEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => GroupEntity,
    group => group.user,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  group: GroupEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.group,
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