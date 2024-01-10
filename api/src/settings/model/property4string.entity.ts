import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { PropertyEntity } from './property.entity';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { LangEntity } from './lang.entity';

@Entity('settings-property4string')
export class Property4stringEntity
  extends BaseEntity
  implements CommonStringEntity<PropertyEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @Column()
  string: string;

  @ManyToOne(
    () => PropertyEntity,
    property => property.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: PropertyEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

  @ManyToOne(
    () => LangEntity,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  lang?: LangEntity | null;

}
