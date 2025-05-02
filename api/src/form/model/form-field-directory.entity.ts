import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FormFieldEntity } from './form-field.entity';

@Entity('form-field-registry')
export class FormFieldDirectoryEntity extends BaseEntity {

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
    field => field.asDirectory,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  field: FormFieldEntity;

}