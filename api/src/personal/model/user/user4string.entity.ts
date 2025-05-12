import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommonStringEntity } from '../../../common/model/common-string.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';

@Entity('personal-user4string')
export class User4stringEntity
  extends BaseEntity
  implements CommonStringEntity<UserEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @Column()
  string: string;

  @ManyToOne(
    () => UserEntity,
    user => user.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}