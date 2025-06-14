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
import { FormFieldEntity } from './form-field.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';

@Entity('form-field2flag')
@Index(['parent', 'flag'], {unique: true})
export class FormField2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FormFieldEntity> {

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
    () => FormFieldEntity,
    form => form.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormFieldEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}