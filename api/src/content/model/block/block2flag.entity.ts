import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('content-block2flag')
@Index([ 'parent', 'flag' ], { unique: true })
export class Block2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<BlockEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => BlockEntity,
    block => block.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

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