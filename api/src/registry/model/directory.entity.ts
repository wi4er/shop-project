import {
  BaseEntity, Check, Column,
  CreateDateColumn, DeleteDateColumn,
  Entity, Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Directory4stringEntity } from './directory4string.entity';
import { PointEntity } from './point.entity';
import { Directory2flagEntity } from './directory2flag.entity';
import { WithFlagEntity } from '../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../common/model/with/with-string.entity';
import { Directory4pointEntity } from './directory4point.entity';
import { WithPointEntity } from '../../common/model/with/with-point.entity';
import { Directory2permissionEntity } from './directory2permission.entity';
import { WithLogEntity } from '../../common/model/with/with-log.entity';
import { Directory2logEntity } from './directory2log.entity';

@Entity('registry-registry')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class DirectoryEntity
  extends BaseEntity
  implements WithFlagEntity<DirectoryEntity>,
    WithStringEntity<DirectoryEntity>,
    WithPointEntity<DirectoryEntity>,
    WithLogEntity<DirectoryEntity> {

  @PrimaryColumn({
    type: 'varchar',
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

  @OneToMany(
    type => Directory2permissionEntity,
    permission => permission.parent,
  )
  permission: Directory2permissionEntity[];

  @OneToMany(
    type => Directory2logEntity,
    log => log.parent,
  )
  log: Directory2logEntity;

}

