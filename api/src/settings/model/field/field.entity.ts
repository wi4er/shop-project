import {
  BaseEntity,
  Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, OneToMany, OneToOne,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { Field4stringEntity } from './field4string.entity';
import { Field2flagEntity } from './field2flag.entity';
import { FieldAsPointEntity } from './field-as-point.entity';
import { FieldAsElementEntity } from './field-as-element.entity';
import { FieldAsStringEntity } from './field-as-string.entity';
import { FieldAsSectionEntity } from './field-as-section.entity';
import { FieldAsFileEntity } from './field-as-file.entity';

@Entity('settings-field')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class FieldEntity
  extends BaseEntity
  implements WithStringEntity<FieldEntity>, WithFlagEntity<FieldEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 36,
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

  @OneToMany(
    type => Field4stringEntity,
    attribute => attribute.parent,
  )
  string: Field4stringEntity[];

  @OneToMany(
    type => Field2flagEntity,
    flag => flag.parent,
  )
  flag: Field2flagEntity[];

  @OneToOne(
    type => FieldAsStringEntity,
    asString => asString.parent,
  )
  asString: FieldAsStringEntity;

  @OneToOne(
    type => FieldAsPointEntity,
    asPoint => asPoint.parent,
  )
  asPoint: FieldAsPointEntity;

  @OneToOne(
    type => FieldAsElementEntity,
    asElement => asElement.parent,
  )
  asElement: FieldAsElementEntity;

  @OneToOne(
    type => FieldAsSectionEntity,
    asSection => asSection.parent,
  )
  asSection: FieldAsSectionEntity;

  @OneToOne(
    type => FieldAsFileEntity,
    asFile => asFile.parent,
  )
  asFile: FieldAsFileEntity;

}