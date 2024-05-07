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
import { Property4stringEntity } from './property4string.entity';
import { Property2flagEntity } from './property2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';

@Entity('settings-property')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class PropertyEntity extends BaseEntity
  implements WithFlagEntity<PropertyEntity>, WithStringEntity<PropertyEntity> {

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
    type => Property4stringEntity,
    property => property.parent,
  )
  string: Property4stringEntity[];

  @OneToMany(
    type => Property2flagEntity,
    flag => flag.parent,
  )
  flag: Property2flagEntity[];

}
