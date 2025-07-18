import {
  BaseEntity,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Form2fieldEntity } from '../../../feedback/model/form/form2field.entity';
import { FieldEntity } from './field.entity';

@Entity('settings-field-as-point')
export class FieldAsPointEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    type => FieldEntity,
    field => field.asPoint,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: Form2fieldEntity;

}