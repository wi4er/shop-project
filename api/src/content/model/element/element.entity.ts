import {
  BaseEntity, Check, Column,
  CreateDateColumn, DeleteDateColumn,
  Entity, Index,
  ManyToOne,
  OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Element2sectionEntity } from './element2section.entity';
import { Element4stringEntity } from './element4string.entity';
import { BlockEntity } from '../block/block.entity';
import { Element4pointEntity } from './element4point.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { Element2flagEntity } from './element2flag.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithPointEntity } from '../../../common/model/with/with-point.entity';
import { Element2permissionEntity } from './element2permission.entity';
import { Element4elementEntity } from './element4element.entity';
import { Element4sectionEntity } from './element4section.entity';
import { WithPermissionEntity } from '../../../common/model/with/with-permission.entity';
import { Element4fileEntity } from './element4file.entity';
import { Element2imageEntity } from './element2image.entity';
import { WithImageEntity } from '../../../common/model/with/with-image.entity';
import { WithDescriptionEntity } from '../../../common/model/with/with-description.entity';
import { Element4descriptionEntity } from './element4description.entity';
import { WithIntervalEntity } from '../../../common/model/with/with-interval.entity';
import { Element4IntervalEntity } from './element4interval.entity';
import { Element4counterEntity } from './element4counterEntity';

@Entity('content-element')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class ElementEntity
  extends BaseEntity
  implements WithStringEntity<ElementEntity>,
    WithFlagEntity<ElementEntity>,
    WithPointEntity<ElementEntity>,
    WithPermissionEntity<ElementEntity>,
    WithImageEntity<ElementEntity>,
    WithDescriptionEntity<ElementEntity>,
    WithIntervalEntity<ElementEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column()
  sort: number = 100;

  @ManyToOne(
    type => BlockEntity,
    block => block.element,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    attribute => attribute.parent,
  )
  string: Element4stringEntity[];

  @OneToMany(
    type => Element4descriptionEntity,
    attribute => attribute.parent,
  )
  description: Element4descriptionEntity[];

  @OneToMany(
    type => Element4IntervalEntity,
    attribute => attribute.parent,
  )
  interval: Element4IntervalEntity[];

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
    type => Element4counterEntity,
    point => point.parent,
  )
  counter: Element4counterEntity[];

  @OneToMany(
    type => Element4elementEntity,
    attribute => attribute.parent,
  )
  element: Element4elementEntity[];

  @OneToMany(
    type => Element4fileEntity,
    attribute => attribute.parent,
  )
  file: Element4fileEntity[];

  @OneToMany(
    type => Element4sectionEntity,
    attribute => attribute.parent,
  )
  section: Element4sectionEntity[];

  @OneToMany(
    type => Element2permissionEntity,
    permission => permission.parent,
  )
  permission: Element2permissionEntity[];

}