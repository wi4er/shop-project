import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FormEntity } from './form.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { FormField2flagEntity } from './form-field2flag.entity';
import { FormField2stringEntity } from './form-field2string.entity';
import { FormFieldStringEntity } from './form-field-string.entity';
import { FormFieldElementEntity } from './form-field-element.entity';
import { FormFieldSectionEntity } from './form-field-section.entity';
import { FormFieldDirectoryEntity } from './form-field-directory.entity';

export enum FormFieldType {

  ELEMENT = 'ELEMENT',
  SECTION = 'SECTION',
  DIRECTORY = 'DIRECTORY',
  STRING = 'STRING',

}

@Entity('form-field')
@Check('not_empty_id', '"id" > \'\'')
export class FormFieldEntity
  extends BaseEntity
  implements WithFlagEntity<FormFieldEntity>, WithStringEntity<FormFieldEntity> {

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

  @Column({
    default: false,
  })
  required: boolean;

  @Column({
    default: FormFieldType.STRING
  })
  type: FormFieldType;

  @ManyToOne(
    () => FormEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  form: FormEntity;

  @OneToOne(
    type => FormFieldStringEntity,
    string => string.field,
    {
      nullable: true,
    },
  )
  asString: FormFieldStringEntity;

  @OneToOne(
    type => FormFieldElementEntity,
    element => element.field,
    {
      nullable: true,
    },
  )
  asElement: FormFieldElementEntity;

  @OneToOne(
    type => FormFieldSectionEntity,
    section => section.field,
    {
      nullable: true,
    },
  )
  asSection: FormFieldSectionEntity;

  @OneToOne(
    type => FormFieldDirectoryEntity,
    directory => directory.field,
    {
      nullable: true,
    },
  )
  asDirectory: FormFieldDirectoryEntity;

  @OneToMany(
    type => FormField2stringEntity,
    string => string.parent,
  )
  string: FormField2stringEntity[];

  @OneToMany(
    type => FormField2flagEntity,
    flag => flag.parent,
  )
  flag: FormField2flagEntity[];

}