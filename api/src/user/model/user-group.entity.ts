import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, VersionColumn, OneToMany, ManyToOne,
} from 'typeorm';
import { UserGroup4stringEntity } from './user-group4string.entity';
import { UserGroup2flagEntity } from './user-group2flag.entity';
import { User2userGroupEntity } from './user2user-group.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';

@Entity('user-group')
export class UserGroupEntity
  extends BaseEntity
  implements WithFlagEntity<UserGroupEntity>, WithStringEntity<UserGroupEntity> {

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
    type => UserGroupEntity,
    group => group.children,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  parent: UserGroupEntity | null;

  @OneToMany(
    type => UserGroupEntity,
    group => group.parent,
  )
  children: UserGroupEntity[];

  @OneToMany(
    type => User2userGroupEntity,
    user => user.group,
  )
  user: User2userGroupEntity[];

  @OneToMany(
    type => UserGroup4stringEntity,
    property => property.parent,
  )
  string: UserGroup4stringEntity[];

  @OneToMany(
    type => UserGroup2flagEntity,
    flag => flag.parent,
  )
  flag: UserGroup2flagEntity[];

}