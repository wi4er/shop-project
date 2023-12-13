import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn
} from 'typeorm';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { ContactEntity } from './contact.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

@Entity('personal-contact4string')
export class Contact4stringEntity
  extends BaseEntity
  implements CommonStringEntity<ContactEntity> {

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
    () => ContactEntity,
    contact => contact.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: ContactEntity;

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