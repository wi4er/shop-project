import {
  BaseEntity,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { SectionEntity } from '../section/section.entity';

@Entity('content-element2section')
@Index(['parent', 'section'], {unique: true})
export class Element2sectionEntity
  extends BaseEntity {

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

}