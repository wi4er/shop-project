import {
  BaseEntity,
  Entity, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './field.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

@Entity('settings-field-as-element')
export class FieldAsElementEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    type => FieldEntity,
    field => field.asElement,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: FieldEntity;

  @ManyToOne(
    type => BlockEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  block: BlockEntity;

}