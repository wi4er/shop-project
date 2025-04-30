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
import { BlockEntity } from '../../content/model/block.entity';

@Entity('settings-attribute-as-element')
@Index([ 'parent', 'block'], {unique: true})
export class AttributeAsElementEntity
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
    type => BlockEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  block: BlockEntity;

  @OneToOne(
    type => AttributeEntity,
    attr => attr.asElement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}