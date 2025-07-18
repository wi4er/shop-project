import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContactEntity } from './contact.entity';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('personal-contact2flag')
@Index(['parent', 'flag'], {unique: true})
export class Contact2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<ContactEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => ContactEntity,
    contact => contact.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ContactEntity;

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