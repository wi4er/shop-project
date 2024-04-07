import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CollectionEntity } from './collection.entity';
import { File2flagEntity } from './file2flag.entity';
import { File4stringEntity } from './file4string.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { WithFlagEntity } from '../../common/model/with-flag.entity';

@Entity('storage-file')
export class FileEntity
  extends BaseEntity
  implements WithStringEntity<FileEntity>, WithFlagEntity<FileEntity> {

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
    type => CollectionEntity,
    collection => collection.files,
  )
  collection: CollectionEntity;

  @OneToMany(
    type => File2flagEntity,
    flag => flag.parent,
  )
  flag: File2flagEntity[];

  @OneToMany(
    type => File4stringEntity,
    property => property.parent,
  )
  string: File4stringEntity[];

}