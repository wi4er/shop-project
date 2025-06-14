import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FormFieldEntity } from './form-field.entity';

@Entity('form-field-string')
export class FormFieldStringEntity extends BaseEntity {

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
    () => FormFieldEntity,
    field => field.asString,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  field: FormFieldEntity;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  constraints: string | null;

}