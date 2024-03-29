import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn, Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { CollectionEntity } from './collection.entity';

@Entity('storage-collection4string')
export class Collection4stringEntity
  extends BaseEntity
  implements CommonStringEntity<CollectionEntity> {

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

  @Column()
  string: string;

  @ManyToOne(
    () => CollectionEntity,
    collection => collection.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: CollectionEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}