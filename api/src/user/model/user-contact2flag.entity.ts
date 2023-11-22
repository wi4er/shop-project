import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { UserContactEntity } from './user-contact.entity';
import { CommonFlagEntity } from '../../common/model/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';

@Entity('user-contact2flag')
@Index(['parent', 'flag'], {unique: true})
export class UserContact2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<UserContactEntity> {

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
    () => UserContactEntity,
    contact => contact.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserContactEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}