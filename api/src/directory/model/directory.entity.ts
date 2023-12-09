import {
  BaseEntity, Check,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Directory4stringEntity } from './directory4string.entity';
import { PointEntity } from './point.entity';
import { Directory2flagEntity } from './directory2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { Directory4pointEntity } from './directory4point.entity';
import { WithPointEntity } from '../../common/model/with-point.entity';

@Entity('directory')
@Check('not_empty_id', '"id" > \'\'')
export class DirectoryEntity
  extends BaseEntity
  implements WithFlagEntity<DirectoryEntity>, WithStringEntity<DirectoryEntity>, WithPointEntity<DirectoryEntity> {

  @PrimaryColumn({
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 100,
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

  @OneToMany(
    type => Directory4stringEntity,
    propertyProperty => propertyProperty.parent,
  )
  string: Directory4stringEntity[];

  @OneToMany(
    type => PointEntity,
    point => point.directory,
  )
  child: PointEntity[];

  @OneToMany(
    type => Directory2flagEntity,
    string => string.parent,
  )
  flag: Directory2flagEntity[];

  @OneToMany(
    type => Directory4pointEntity,
    point => point.parent,
  )
  point: Directory4pointEntity[];

}