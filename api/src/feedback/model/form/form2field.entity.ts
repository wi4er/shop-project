import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FormEntity } from './form.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';

export enum FormFieldType {

  ELEMENT = 'ELEMENT',
  SECTION = 'SECTION',
  DIRECTORY = 'DIRECTORY',
  STRING = 'STRING',

}

@Entity('feedback-form2field')
@Check('not_empty_id', '"id" > \'\'')
export class Form2fieldEntity
  extends BaseEntity {

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

  @ManyToOne(
    type => FormEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

  @ManyToOne(
    type => FieldEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  field: FieldEntity;

}