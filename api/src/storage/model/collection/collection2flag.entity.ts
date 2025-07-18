import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { CollectionEntity } from './collection.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('storage-collection2flag')
@Index(['parent', 'flag'], {unique: true})
export class Collection2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<CollectionEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => CollectionEntity,
    file => file.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: CollectionEntity;

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