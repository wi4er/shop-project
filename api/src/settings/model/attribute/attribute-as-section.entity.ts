import {
  BaseEntity,
  Entity,
  Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

@Entity('settings-attribute-as-section')
@Index([ 'parent', 'block'], {unique: true})
export class AttributeAsSectionEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

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
    attr => attr.asSection,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: AttributeEntity;

}