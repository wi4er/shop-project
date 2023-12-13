import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';

@Entity('personal-user2group')
@Index(['group', 'parent'], {unique: true})
export class User2groupEntity extends BaseEntity {

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
    type => GroupEntity,
    group => group.user,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  group: GroupEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.group,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  parent: UserEntity;

}