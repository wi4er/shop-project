import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { PointEntity } from './point.entity';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { LangEntity } from '../../settings/model/lang.entity';

@Entity('directory-point4string')
export class Point4stringEntity
  extends BaseEntity
  implements CommonStringEntity<PointEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null

  @VersionColumn()
  version: number;

  @Column()
  string: string;

  @ManyToOne(
    () => PointEntity,
    directory => directory.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: PointEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}