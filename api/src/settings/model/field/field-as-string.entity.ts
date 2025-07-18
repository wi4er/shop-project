import {
  BaseEntity, Column,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './field.entity';

@Entity('feedback-field-string')
export class FieldAsStringEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    type => FieldEntity,
    field => field.asString,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn()
  parent: FieldEntity;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  constraints: string | null;

}