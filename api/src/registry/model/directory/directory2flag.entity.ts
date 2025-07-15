import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DirectoryEntity } from './directory.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('registry-directory2flag')
@Index(['parent', 'flag'], {unique: true})
export class Directory2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<DirectoryEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DirectoryEntity,
    directory => directory.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

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