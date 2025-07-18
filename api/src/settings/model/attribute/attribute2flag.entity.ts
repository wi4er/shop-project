import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../flag/flag.entity';

@Entity('settings-attribute2flag')
@Index(['parent', 'flag'], {unique: true})
export class Attribute2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<AttributeEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => AttributeEntity,
    attribute => attribute.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: AttributeEntity;

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