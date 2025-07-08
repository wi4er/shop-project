import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FormEntity } from './form.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('feedback-form2flag')
@Index(['parent', 'flag'], {unique: true})
export class Form2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FormEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FormEntity,
    form => form.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

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