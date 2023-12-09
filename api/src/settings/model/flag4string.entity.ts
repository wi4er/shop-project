import {
  BaseEntity,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { FlagEntity } from './flag.entity';
import { CommonStringEntity } from '../../common/model/common-string.entity';
import { PropertyEntity } from './property.entity';
import { LangEntity } from './lang.entity';

@Entity('flag4string')
export class Flag4stringEntity
  extends BaseEntity
  implements CommonStringEntity<FlagEntity> {

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
    () => FlagEntity,
    flag => flag.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: FlagEntity;

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