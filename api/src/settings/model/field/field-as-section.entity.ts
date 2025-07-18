import {
  BaseEntity,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './field.entity';

@Entity('settings-field-as-section')
export class FieldAsSectionEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    type => FieldEntity,
    field => field.asSection,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: FieldEntity;

}