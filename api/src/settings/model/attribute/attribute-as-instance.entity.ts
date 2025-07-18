import {
  BaseEntity,
  Entity, Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { DocumentEntity } from '../../../bundle/model/document/document.entity';

@Entity('settings-attribute-as-instance')
@Index(['parent', 'document'], { unique: true })
export class AttributeAsInstanceEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

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