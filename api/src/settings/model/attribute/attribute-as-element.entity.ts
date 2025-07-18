import {
  BaseEntity,
  Entity,
  Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

@Entity('settings-attribute-as-element')
@Index([ 'parent', 'block'], {unique: true})
export class AttributeAsElementEntity
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