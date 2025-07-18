import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SectionEntity } from './section.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('content-section2flag')
@Index(['parent', 'flag'], {unique: true})
export class Section2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<SectionEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => SectionEntity,
    section => section.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: SectionEntity;

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