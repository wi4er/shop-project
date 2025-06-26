import {
  BaseEntity,
  Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, JoinColumn,
  OneToMany, OneToOne,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Attribute4stringEntity } from './attribute4string.entity';
import { Attribute2flagEntity } from './attribute2flag.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { AttributeAsPointEntity } from './attribute-as-point.entity';
import { AttributeAsElementEntity } from './attribute-as-element.entity';
import { AttributeAsSectionEntity } from './attribute-as-section.entity';
import { AttributeAsFileEntity } from './attribute-as-file.entity';

export enum AttributeType {

  STRING = 'STRING',
  DESCRIPTION = 'DESCRIPTION',
  INTERVAL = 'INTERVAL',

  POINT = 'POINT',
  COUNTER = 'COUNTER',

  ELEMENT = 'ELEMENT',
  SECTION = 'SECTION',

  FILE = 'FILE',

  INSTANCE = 'INSTANCE',

}

@Entity('settings-attribute')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class AttributeEntity extends BaseEntity
  implements WithFlagEntity<AttributeEntity>, WithStringEntity<AttributeEntity> {

  @PrimaryColumn({
    type: 'varchar',
    length: 50,
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

  @Column({
    type: 'enum',
    enum: AttributeType,
    nullable: false,
    default: AttributeType.STRING,
    update: false,
  })
  type: AttributeType;

  @OneToMany(
    type => Attribute4stringEntity,
    attribute => attribute.parent,
  )
  string: Attribute4stringEntity[];

  @OneToMany(
    type => Attribute2flagEntity,
    flag => flag.parent,
  )
  flag: Attribute2flagEntity[];

  @OneToOne(
    type => AttributeAsPointEntity,
    asDir => asDir.parent,
  )
  asDirectory: AttributeAsPointEntity;

  @OneToOne(
    type => AttributeAsElementEntity,
    asElement => asElement.parent,
  )
  asElement: AttributeAsElementEntity;

  @OneToOne(
    type => AttributeAsSectionEntity,
    asSection => asSection.parent,
  )
  asSection: AttributeAsSectionEntity;

  @OneToOne(
    type => AttributeAsFileEntity,
    asFile => asFile.parent,
  )
  asFile: AttributeAsFileEntity;

}
