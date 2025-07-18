import {
  BaseEntity,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { FileEntity } from './file.entity';

@Entity('storage-file2flag')
@Index(['parent', 'flag'], {unique: true})
export class File2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FileEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FileEntity,
    file => file.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FileEntity;

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