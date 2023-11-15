import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../common/model/common-flag.entity';
import { FlagEntity } from '../../flag/model/flag.entity';
import { FormEntity } from './form.entity';
import { CommonStringEntity } from '../../common/model/common-string.entity';

@Entity('form2flag')
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
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}