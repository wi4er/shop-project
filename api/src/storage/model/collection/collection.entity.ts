import {
  BaseEntity, Check,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { FileEntity } from '../file/file.entity';
import { File2flagEntity } from '../file/file2flag.entity';
import { Collection2flagEntity } from './collection2flag.entity';
import { Collection4stringEntity } from './collection4string.entity';

@Entity('storage-collection')
@Check('not_empty_id', '"id" > \'\'')
export class CollectionEntity
  extends BaseEntity {

  @PrimaryColumn({
    type: "varchar",
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

  @OneToMany(
    type => FileEntity,
    file => file.collection,
    {
      onDelete: 'CASCADE'
    }
  )
  files: FileEntity[];

  @OneToMany(
    type => Collection2flagEntity,
    flag => flag.parent,
  )
  flag: File2flagEntity[];

  @OneToMany(
    type => Collection4stringEntity,
    property => property.parent,
  )
  string: Collection4stringEntity[];

}