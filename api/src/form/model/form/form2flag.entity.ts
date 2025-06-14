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

@Entity('form-form2flag')
@Index(['parent', 'flag'], {unique: true})
export class Form2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<FormEntity> {

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
    () => FormEntity,
    form => form.flag,
    {
      cascade: true,
      nullable: false,
    },
  )
  parent: FormEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      cascade: true,
      nullable: false,
    },
  )
  flag: FlagEntity;

}