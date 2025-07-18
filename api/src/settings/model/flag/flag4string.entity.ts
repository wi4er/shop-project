import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlagEntity } from './flag.entity';
import { CommonStringEntity } from '../../../common/model/common/common-string.entity';
import { AttributeEntity } from '../attribute/attribute.entity';
import { LangEntity } from '../lang/lang.entity';

@Entity('settings-flag4string')
export class Flag4stringEntity
  extends BaseEntity
  implements CommonStringEntity<FlagEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  string: string;

  @ManyToOne(
    type => FlagEntity,
    flag => flag.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FlagEntity;

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