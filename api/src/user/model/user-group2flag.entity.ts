import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn
} from "typeorm";
import { UserGroupEntity } from "./user-group.entity";
import { CommonFlagEntity } from "../../common/model/common-flag.entity";
import { FlagEntity } from '../../settings/model/flag.entity';

@Entity('user-group2flag')
@Index([ 'parent', 'flag' ], { unique: true })
export class UserGroup2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<UserGroupEntity>
{

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
    () => UserGroupEntity,
    user => user.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserGroupEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}