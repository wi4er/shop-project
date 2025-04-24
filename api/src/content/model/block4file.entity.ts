import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FileEntity } from '../../storage/model/file.entity';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { BlockEntity } from './block.entity';

@Entity('content-block4file')
@Index(['file', 'parent', 'property'], {unique: true})
export class Block4fileEntity
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
    () => BlockEntity,
    block => block.file,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: AttributeEntity;

}