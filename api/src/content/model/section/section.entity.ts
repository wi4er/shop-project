import {
  BaseEntity, Check, Column,
  CreateDateColumn, DeleteDateColumn,
  Entity, Index,
  ManyToOne,
  OneToMany, PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Element2sectionEntity } from '../element/element2section.entity';
import { BlockEntity } from '../block/block.entity';
import { Section4stringEntity } from './section4string.entity';
import { Section2flagEntity } from './section2flag.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { Section4pointEntity } from './section4point.entity';
import { Section2permissionEntity } from './section2permission.entity';
import { WithPointEntity } from '../../../common/model/with/with-point.entity';
import { WithPermissionEntity } from '../../../common/model/with/with-permission.entity';
import { Section4fileEntity } from './section4file.entity';
import { Section2imageEntity } from './section2image.entity';

@Entity('content-section')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class SectionEntity
  extends BaseEntity
  implements WithFlagEntity<SectionEntity>,
    WithStringEntity<SectionEntity>,
    WithPointEntity<SectionEntity>,
    WithPermissionEntity<SectionEntity> {

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
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @Column()
  sort: number = 100;

  @ManyToOne(
    type => SectionEntity,
    section => section.children,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  parent: SectionEntity;

  @ManyToOne(
    type => BlockEntity,
    block => block.section,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  block: BlockEntity;

  @OneToMany(
    type => SectionEntity,
    section => section.parent,
  )
  children: SectionEntity[];

  @OneToMany(
    type => Section2imageEntity,
    image => image.parent,
  )
  image: Section2imageEntity[];

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
    type => Section4pointEntity,
    point => point.parent,
  )
  point: Section4pointEntity[];

  @OneToMany(
    type => Section4stringEntity,
    property => property.parent,
  )
  string: Section4stringEntity[];

  @OneToMany(
    type => Section4fileEntity,
    file => file.parent,
  )
  file: Section4fileEntity[];

  @OneToMany(
    type => Section2permissionEntity,
    permission => permission.parent,
  )
  permission: Section2permissionEntity[];

}