import {
  BaseEntity,
  Entity,
  Index, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { FieldEntity } from './field.entity';

@Entity('settings-field-as-file')
@Index([ 'parent', 'collection'], {unique: true})
export class FieldAsFileEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

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
    type => FieldEntity,
    attr => attr.asFile,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: FieldEntity;

}