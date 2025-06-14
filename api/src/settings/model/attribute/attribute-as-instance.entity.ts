import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { DocumentEntity } from '../../../bundle/model/document/document.entity';

@Entity('settings-attribute-as-instance')
@Index(['parent', 'document'], { unique: true })
export class AttributeAsInstanceEntity
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
    type => DocumentEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  document: DocumentEntity;

  @OneToOne(
    type => AttributeEntity,
    attr => attr.asDirectory,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}