import {
  BaseEntity,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Element2sectionEntity } from './element2section.entity';
import { BlockEntity } from './block.entity';
import { Element2pointEntity } from './element2point.entity';
import { Section2stringEntity } from './section2string.entity';
import { Section2flagEntity } from './section2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { Section2pointEntity } from './section2point.entity';

@Entity('content-section')
export class SectionEntity
  extends BaseEntity
  implements WithFlagEntity<SectionEntity>, WithStringEntity<SectionEntity> {

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
    type => SectionEntity,
    section => section.children,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  parent: SectionEntity;

  @OneToMany(
    type => SectionEntity,
    section => section.parent,
  )
  children: SectionEntity[];

  @ManyToOne(
    type => BlockEntity,
    block => block.section,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  block: BlockEntity;

  @OneToMany(
    type => Section2stringEntity,
    property => property.parent,
  )
  string: Section2stringEntity[];

  @OneToMany(
    type => Section2flagEntity,
    flag => flag.parent,
  )
  flag: Section2flagEntity[];

  @OneToMany(
    type => Element2sectionEntity,
    section => section.section,
  )
  element: Element2sectionEntity[];

  @OneToMany(
    type => Section2pointEntity,
    point => point.parent,
  )
  point: Section2pointEntity[];

}