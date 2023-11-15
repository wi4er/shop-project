import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { LangEntity } from '../../lang/model/lang.entity';
import { FormEntity } from './form.entity';

@Entity('form2string')
export class Form2stringEntity
  extends BaseEntity
  implements CommonStringEntity<FormEntity> {

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
    () => FormEntity,
    property => property.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}
