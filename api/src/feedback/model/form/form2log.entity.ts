import {
  BaseEntity, Column,
  CreateDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonLogEntity } from '../../../common/model/common/common-log.entity';
import { FormEntity } from './form.entity';

@Entity('feedback-form2log')
export class Form2logEntity
  extends BaseEntity
  implements CommonLogEntity<FormEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  version: number;

  @ManyToOne(
    type => FormEntity,
    point => point.log,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FormEntity;

  @Column()
  value: string;

  @Column({nullable: true})
  from: string;

  @Column({nullable: true})
  to: string;

}
