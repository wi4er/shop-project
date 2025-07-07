import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { AttributeEntity } from './attribute.entity';

@Entity('settings-attribute-as-point')
@Index([ 'parent', 'directory'], {unique: true})
export class AttributeAsPointEntity
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
    type => DirectoryEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  directory: DirectoryEntity;

  @OneToOne(
    type => AttributeEntity,
    attr => attr.asPoint,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}