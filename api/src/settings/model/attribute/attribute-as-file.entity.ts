import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';

@Entity('settings-attribute-as-file')
@Index([ 'parent', 'collection'], {unique: true})
export class AttributeAsFileEntity
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
    type => CollectionEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  collection: CollectionEntity;

  @OneToOne(
    type => AttributeEntity,
    attr => attr.asFile,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}