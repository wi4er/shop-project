import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FileEntity } from '../../../storage/model/file/file.entity';
import { SectionEntity } from './section.entity';

@Entity('content-section2image')
@Index(['parent', 'image'], {unique: true})
export class Section2imageEntity
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
    type => SectionEntity,
    section => section.image,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: SectionEntity;

  @ManyToOne(
    type => FileEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  image: FileEntity;

}