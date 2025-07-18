import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from '../group/group.entity';

@Entity('personal-user2group')
@Index(['group', 'parent'], {unique: true})
export class User2groupEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => GroupEntity,
    group => group.user,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  group: GroupEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.group,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  parent: UserEntity;

}