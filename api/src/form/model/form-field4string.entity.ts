import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { FormFieldEntity } from './form-field.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';

@Entity('form-field4string')
export class FormField4stringEntity
  extends BaseEntity
  implements CommonStringEntity<FormFieldEntity> {

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

  @Column()
  string: string;

  @ManyToOne(
    () => FormFieldEntity,
    field => field.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormFieldEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}
