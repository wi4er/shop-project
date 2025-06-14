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
import { CommonStringEntity } from '../../../common/model/common/common-string.entity';
import { AttributeEntity } from '../attribute/attribute.entity';
import { LangEntity } from '../lang/lang.entity';

@Entity('settings-flag4string')
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
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: FlagEntity;

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