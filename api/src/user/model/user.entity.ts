import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Check,
} from 'typeorm';
import { User2stringEntity } from './user2string.entity';
import { User2flagEntity } from './user2flag.entity';
import { User2pointEntity } from './user2point.entity';
import { User2userEntity } from './user2user.entity';
import { User2descriptionEntity } from './user2description.entity';
import { User2userContactEntity } from './user2user-contact.entity';
import { User2userGroupEntity } from './user2user-group.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { WithPointEntity } from '../../common/model/with-point.entity';

@Entity('user')
@Check('not_empty_login', '"login" > \'\'')
export class UserEntity
  extends BaseEntity
  implements WithFlagEntity<UserEntity>, WithStringEntity<UserEntity>, WithPointEntity<UserEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column({
    unique: true,
  })
  login: string;

  @Column({ nullable: true })
  hash: string;

  @OneToMany(
    type => User2userContactEntity,
    contact => contact.parent,
  )
  contact: User2userContactEntity[];

  @OneToMany(
    type => User2userGroupEntity,
    contact => contact.parent,
  )
  group: User2userGroupEntity[];

  @OneToMany(
    type => User2stringEntity,
    property => property.parent,
  )
  string: User2stringEntity[];

  @OneToMany(
    type => User2descriptionEntity,
    property => property.parent,
  )
  description: User2descriptionEntity[];

  @OneToMany(
    type => User2pointEntity,
    point => point.parent,
  )
  point: User2pointEntity[];

  @OneToMany(
    type => User2flagEntity,
    flag => flag.parent,
  )
  flag: User2flagEntity[];

  @OneToMany(
    type => User2userEntity,
    user => user.parent,
  )
  child: User2userEntity[];

}
