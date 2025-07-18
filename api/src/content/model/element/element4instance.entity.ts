import {
  BaseEntity,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { InstanceEntity } from '../../../bundle/model/instance/instance.entity';

@Entity('content-element4instance')
export class Element4InstanceEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => InstanceEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  instance: InstanceEntity;

  @ManyToOne(
    type => ElementEntity,
    element => element.file,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

  @ManyToOne(
    type => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}