import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';
import { CommonDescriptionEntity } from '../../../common/model/common-description.entity';

@Entity('content-block4description')
export class Block4descriptionEntity
  extends BaseEntity
  implements CommonDescriptionEntity<BlockEntity> {

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

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(
    type => BlockEntity,
    block => block.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

  @ManyToOne(
    type => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

  @ManyToOne(
    type => LangEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}