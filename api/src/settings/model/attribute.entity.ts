import {
  BaseEntity,
  Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Attribute4stringEntity } from './attribute4string.entity';
import { Attribute2flagEntity } from './attribute2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';

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

  @OneToMany(
    type => Attribute4stringEntity,
    property => property.parent,
  )
  string: Attribute4stringEntity[];

  @OneToMany(
    type => Attribute2flagEntity,
    flag => flag.parent,
  )
  flag: Attribute2flagEntity[];

}
