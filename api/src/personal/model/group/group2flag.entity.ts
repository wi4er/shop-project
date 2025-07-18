import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupEntity } from './group.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('personal-group2flag')
@Index(['parent', 'flag'], {unique: true})
export class Group2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<GroupEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => GroupEntity,
    user => user.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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