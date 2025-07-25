import {
  BaseEntity, Check,
  Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { FormEntity } from './form.entity';
import { FieldEntity } from '../../../settings/model/field/field.entity';
import { CommonFieldEntity } from '../../../common/model/common/common-field.entity';

@Entity('feedback-form2field')
export class Form2fieldEntity
  extends BaseEntity
  implements CommonFieldEntity<FormEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => FormEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

  @ManyToOne(
    type => FieldEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  field: FieldEntity;

}