import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { WithFlagEntity } from '../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../common/model/with/with-string.entity';
import { Form2flagEntity } from './form2flag.entity';
import { Form4stringEntity } from './form4string.entity';
import { FormFieldEntity } from './form-field.entity';
import { ResultEntity } from './result.entity';

@Entity('form-form')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class FormEntity
  extends BaseEntity
  implements WithFlagEntity<FormEntity>, WithStringEntity<FormEntity> {

  @PrimaryColumn({
    type: 'varchar',
    length: 50,
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column()
  sort: number = 100;

  @OneToMany(
    type => Form4stringEntity,
    string => string.parent,
  )
  string: Form4stringEntity[];

  @OneToMany(
    type => Form2flagEntity,
    flag => flag.parent,
  )
  flag: Form2flagEntity[];

  @OneToMany(
    type => FormFieldEntity,
    string => string.form,
  )
  field: FormFieldEntity[];

  @OneToMany(
    type => ResultEntity,
    result => result.form,
  )
  result: ResultEntity[];

}