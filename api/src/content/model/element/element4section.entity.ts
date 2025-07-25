import {
  BaseEntity,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { SectionEntity } from '../section/section.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-element4section')
@Index(['parent', 'section', 'attribute'], {unique: true})
export class Element4sectionEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => ElementEntity,
    element => element.section,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => SectionEntity,
    section => section.element,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  section: SectionEntity;

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