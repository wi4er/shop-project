import {
  BaseEntity,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonFlagEntity } from '../../../common/model/common/common-flag.entity';
import { FlagEntity } from '../../../settings/model/flag/flag.entity';
import { DocumentEntity } from './document.entity';

@Entity('bundle-document2flag')
@Index(['parent', 'flag'], {unique: true})
export class Document2flagEntity
  extends BaseEntity
  implements CommonFlagEntity<DocumentEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DocumentEntity,
    document => document.flag,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DocumentEntity;

  @ManyToOne(
    type => FlagEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  flag: FlagEntity;

}