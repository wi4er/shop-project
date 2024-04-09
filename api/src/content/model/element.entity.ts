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
import { Element2permissionEntity } from './element2permission.entity';
import { Element4elementEntity } from './element4element.entity';
import { Element4sectionEntity } from './element4section.entity';
import { WithPermissionEntity } from '../../common/model/with-permission.entity';
import { Element4fileEntity } from './element4file.entity';
import { Element2imageEntity } from './element2image.entity';
import { WithImageEntity } from '../../common/model/with-image.entity';

@Entity('content-element')
export class ElementEntity
  extends BaseEntity
  implements WithStringEntity<ElementEntity>,
    WithFlagEntity<ElementEntity>,
    WithPointEntity<ElementEntity>,
    WithPermissionEntity<ElementEntity>,
    WithImageEntity<ElementEntity> {

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
  parent: Element2sectionEntity[];

  @OneToMany(
    type => Element2imageEntity,
    image => image.parent,
  )
  image: Array<Element2imageEntity>;

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
    type => Element4fileEntity,
    file => file.parent,
  )
  file: Element4fileEntity[];

  @OneToMany(
    type => Element4sectionEntity,
    section => section.parent,
  )
  section: Element4sectionEntity[];

  @OneToMany(
    type => Element2permissionEntity,
    permission => permission.parent,
  )
  permission: Element2permissionEntity[];

}