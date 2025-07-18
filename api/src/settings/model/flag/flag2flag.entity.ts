import {
  BaseEntity,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlagEntity } from './flag.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';

@Entity('settings-flag2flag')
@Index(['parent', 'flag'], {unique: true})
export class Flag2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FlagEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FlagEntity,
    flag => flag.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FlagEntity;

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