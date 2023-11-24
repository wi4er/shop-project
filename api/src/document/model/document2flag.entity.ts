import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../common/model/common-flag.entity';
import { FlagEntity } from '../../settings/model/flag.entity';
import { DocumentEntity } from './document.entity';

@Entity('document2flag')
@Index(['parent', 'flag'], {unique: true})
export class Document2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<DocumentEntity> {

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

  @ManyToOne(
    () => DocumentEntity,
    document => document.flag,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: DocumentEntity;

  @ManyToOne(
    () => FlagEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}