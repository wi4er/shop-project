import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttributeEntity } from './attribute.entity';
import { CommonStringEntity } from '../../../common/model/common/common-string.entity';
import { LangEntity } from '../lang/lang.entity';

@Entity('settings-attribute4string')
export class Attribute4stringEntity
  extends BaseEntity
  implements CommonStringEntity<AttributeEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  string: string;

  @ManyToOne(
    type => AttributeEntity,
    attribute => attribute.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: AttributeEntity;

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
