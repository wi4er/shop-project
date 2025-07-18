import {
  BaseEntity, Column,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonStringEntity } from '../../../common/model/common/common-string.entity';
import { GroupEntity } from './group.entity';
import { LangEntity } from '../../../settings/model/lang/lang.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';

@Entity('personal-group4string')
export class Group4stringEntity
  extends BaseEntity
  implements CommonStringEntity<GroupEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  string: string;

  @ManyToOne(
    () => GroupEntity,
    group => group.string,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: GroupEntity;

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