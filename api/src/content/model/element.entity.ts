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
import { Element4stringEntity } from './element4string.entity';
import { BlockEntity } from './block.entity';
import { Element4pointEntity } from './element4point.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { Element2flagEntity } from './element2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithPointEntity } from '../../common/model/with-point.entity';
import { ElementPermissionEntity } from './element-permission.entity';
import { Element4elementEntity } from './element4element.entity';

@Entity('content-element')
export class ElementEntity
  extends BaseEntity
  implements WithStringEntity<ElementEntity>, WithFlagEntity<ElementEntity>, WithPointEntity<ElementEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @ManyToOne(
    type => BlockEntity,
    block => block.element,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  block: BlockEntity;

  @OneToMany(
    type => Element2sectionEntity,
    section => section.parent,
  )
  section: Element2sectionEntity[];

  @OneToMany(
    type => Element4stringEntity,
    property => property.parent,
  )
  string: Element4stringEntity[];

  @OneToMany(
    type => Element2flagEntity,
    flag => flag.parent,
  )
  flag: Element2flagEntity[];

  @OneToMany(
    type => Element4pointEntity,
    point => point.parent,
  )
  point: Element4pointEntity[];

  @OneToMany(
    type => Element4elementEntity,
    element => element.parent,
  )
  element: Element4elementEntity[];

  @OneToMany(
    type => ElementPermissionEntity,
    permission => permission.parent,
  )
  permission: ElementPermissionEntity[];

}