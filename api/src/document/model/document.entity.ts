import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';
import { Document2flagEntity } from './document2flag.entity';
import { Document2stringEntity } from './document2string.entity';

@Entity('document')
export class DocumentEntity
  extends BaseEntity
  implements WithFlagEntity<DocumentEntity>, WithStringEntity<DocumentEntity> {

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

  @OneToMany(
    type => Document2stringEntity,
    string => string.parent,
  )
  string: Document2stringEntity[];

  @OneToMany(
    type => Document2flagEntity,
    flag => flag.parent,
  )
  flag: Document2flagEntity[];

}