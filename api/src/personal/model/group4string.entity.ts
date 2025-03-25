import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { GroupEntity } from './group.entity';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

@Entity('personal-group4string')
export class Group4stringEntity
  extends BaseEntity
  implements CommonStringEntity<GroupEntity> {

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
    () => GroupEntity,
    group => group.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: GroupEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

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