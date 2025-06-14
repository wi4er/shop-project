import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FormFieldEntity } from './form-field.entity';
import { ElementEntity } from '../../../content/model/element/element.entity';

@Entity('form-field-element')
export class FormFieldElementEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @OneToOne(
    type => FormFieldEntity,
    field => field.asString,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  field: FormFieldEntity;

}