import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BlockEntity } from "./block.entity";
import { CommonStringEntity } from "../../../common/model/common/common-string.entity";
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('content-block4string')
export class Block4stringEntity
  extends BaseEntity
  implements CommonStringEntity<BlockEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  string: string;

  @ManyToOne(
    type => BlockEntity,
    block => block.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

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