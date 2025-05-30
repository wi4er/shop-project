import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Check, PrimaryColumn,
} from 'typeorm';
import { User4stringEntity } from './user4string.entity';
import { User2flagEntity } from './user2flag.entity';
import { User4pointEntity } from './user4point.entity';
import { User4userEntity } from './user4user.entity';
import { User4descriptionEntity } from './user4description.entity';
import { User2contactEntity } from './user2contact.entity';
import { User2groupEntity } from './user2group.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { WithPointEntity } from '../../../common/model/with/with-point.entity';
import { User2imageEntity } from './user2image.entity';

@Entity('personal-user')
@Check('not_empty_login', '"login" > \'\'')
export class UserEntity
  extends BaseEntity
  implements WithFlagEntity<UserEntity>, WithStringEntity<UserEntity>, WithPointEntity<UserEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

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
    type => User2contactEntity,
    contact => contact.parent,
  )
  contact: User2contactEntity[];

  @OneToMany(
    type => User2groupEntity,
    contact => contact.parent,
  )
  group: User2groupEntity[];

  @OneToMany(
    type => User2imageEntity,
    image => image.parent,
  )
  image: Array<User2imageEntity>;

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

