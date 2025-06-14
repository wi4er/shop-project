import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { SectionEntity } from './section.entity';

@Entity('content-section4file')
@Index(['file', 'parent', 'attribute'], {unique: true})
export class Section4fileEntity
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
    () => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  file: FileEntity;

  @ManyToOne(
    () => SectionEntity,
    section => section.file,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: SectionEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}