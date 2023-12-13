import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ContactEntity } from './contact.entity';
import { CommonFlagEntity } from '../../common/model/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';

@Entity('personal-contact2flag')
@Index(['parent', 'flag'], {unique: true})
export class Contact2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<ContactEntity> {

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
    () => ContactEntity,
    contact => contact.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: ContactEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}