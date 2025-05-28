import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { FileEntity } from '../../../storage/model/file.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

@Entity('content-element4file')
@Index(['file', 'parent', 'attribute'], {unique: true})
export class Element4fileEntity
  extends BaseEntity {

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

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  file: FileEntity;

  @ManyToOne(
    type => ElementEntity,
    element => element.file,
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

}