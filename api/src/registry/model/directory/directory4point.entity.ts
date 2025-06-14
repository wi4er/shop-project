import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonPointEntity } from '../../../common/model/common/common-point.entity';
import { PointEntity } from '../point/point.entity';
import { DirectoryEntity } from './directory.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('registry-directory4point')
@Index(['point', 'attribute', 'parent'], {unique: true})
export class Directory4pointEntity
  extends BaseEntity
  implements CommonPointEntity<DirectoryEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(
    () => PointEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  point: PointEntity;

  @ManyToOne(
    () => DirectoryEntity,
    directory => directory.point,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}