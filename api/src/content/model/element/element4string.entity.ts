import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { CommonStringEntity } from '../../../common/model/common-string.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

@Entity('content-element4string')
export class Element4stringEntity
  extends BaseEntity
  implements CommonStringEntity<ElementEntity> {

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
    type => ElementEntity,
    element => element.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

  @ManyToOne(
    type => LangEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}