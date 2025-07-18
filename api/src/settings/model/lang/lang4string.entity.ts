import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LangEntity } from './lang.entity';
import { CommonStringEntity } from '../../../common/model/common/common-string.entity';
import { AttributeEntity } from '../attribute/attribute.entity';

@Entity('settings-lang4string')
export class Lang4stringEntity
  extends BaseEntity
  implements CommonStringEntity<LangEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  string: string;

  @ManyToOne(
    type => LangEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

  @ManyToOne(
    type => LangEntity,
    lang => lang.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: LangEntity;

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