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
import { User4stringEntity } from './user4string.entity';
import { User2flagEntity } from './user2flag.entity';
import { User4pointEntity } from './user4point.entity';
import { User4userEntity } from './user4user.entity';
import { User4descriptionEntity } from './user4description.entity';
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
    type => User4stringEntity,
    property => property.parent,
  )
  string: User4stringEntity[];

  @OneToMany(
    type => User4descriptionEntity,
    property => property.parent,
  )
  description: User4descriptionEntity[];

  @OneToMany(
    type => User4pointEntity,
    point => point.parent,
  )
  point: User4pointEntity[];

  @OneToMany(
    type => User2flagEntity,
    flag => flag.parent,
  )
  flag: User2flagEntity[];

  @OneToMany(
    type => User4userEntity,
    user => user.parent,
  )
  child: User4userEntity[];

}
