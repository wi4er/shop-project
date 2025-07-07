import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { Form2flagEntity } from './form2flag.entity';
import { Form4stringEntity } from './form4string.entity';
import { Form2fieldEntity } from './form2field.entity';
import { ResultEntity } from '../result/result.entity';
import { Form4pointEntity } from './form4point.entity';

@Entity('feedback-feedback')
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
    type => Form2flagEntity,
    flag => flag.parent,
  )
  flag: Form2flagEntity[];

  @OneToMany(
    type => Form2fieldEntity,
    field => field.parent,
  )
  field: Form2fieldEntity[];

  @OneToMany(
    type => ResultEntity,
    result => result.form,
  )
  result: ResultEntity[];

  @OneToMany(
    type => Form4stringEntity,
    string => string.parent,
  )
  string: Form4stringEntity[];

  @OneToMany(
    type => Form4pointEntity,
    point => point.parent,
  )
  point: Form4pointEntity[];

}