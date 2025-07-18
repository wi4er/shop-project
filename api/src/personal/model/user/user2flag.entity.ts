import {
  BaseEntity,
  Entity, Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('personal-user2flag')
@Index(['parent', 'flag'], {unique: true})
export class User2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<UserEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => UserEntity,
    user => user.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

  @ManyToOne(
    type => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}