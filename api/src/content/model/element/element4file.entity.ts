import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-element4file')
@Index(['file', 'parent', 'attribute'], {unique: true})
export class Element4fileEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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