import {
  BaseEntity, Column,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementEntity } from './element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { CommonDescriptionEntity } from '../../../common/model/common/common-description.entity';

@Entity('content-element4description')
export class Element4descriptionEntity
  extends BaseEntity
  implements CommonDescriptionEntity<ElementEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text'
  })
  description: string;

  @ManyToOne(
    type => ElementEntity,
    element => element.string,
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

  @ManyToOne(
    type => LangEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}