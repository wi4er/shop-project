import {
  BaseEntity, Check,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { DirectoryEntity } from './directory.entity';
import { Point4stringEntity } from './point4string.entity';
import { Point2flagEntity } from './point2flag.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { Point4pointEntity } from './point4point.entity';
import { WithPointEntity } from '../../common/model/with-point.entity';

@Entity('directory-point')
@Check('not_empty_id', '"id" > \'\'')
export class PointEntity
  extends BaseEntity
  implements WithFlagEntity<PointEntity>, WithStringEntity<PointEntity>, WithPointEntity<PointEntity> {

  @PrimaryColumn({
    type: 'varchar',
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

  @OneToMany(
    type => Point4stringEntity,
    string => string.parent,
  )
  string: Point4stringEntity[];

  @ManyToOne(
    type => DirectoryEntity,
    directory => directory.point,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  directory: DirectoryEntity;

  @OneToMany(
    type => Point2flagEntity,
    string => string.parent,
  )
  flag: Point2flagEntity[];

  @OneToMany(
    type => Point4pointEntity,
    point => point.parent,
  )
  point: Point4pointEntity[];

}