import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { FileEntity } from '../../storage/model/file.entity';

@Entity('content-element2image')
@Index(['parent', 'image'], {unique: true})
export class Element2imageEntity
  extends BaseEntity {

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
    () => ElementEntity,
    element => element.image,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  image: FileEntity;

}