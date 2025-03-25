import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn
} from "typeorm";
import { GroupEntity } from "./group.entity";
import { CommonFlagEntity } from "../../common/model/common-flag.entity";
import { FlagEntity } from '../../settings/model/flag.entity';

@Entity('personal-group2flag')
@Index([ 'parent', 'flag' ], { unique: true })
export class Group2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<GroupEntity>
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
    () => GroupEntity,
    user => user.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: GroupEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}