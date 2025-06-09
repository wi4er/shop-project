import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { WithFlagEntity } from '../../../common/model/with/with-flag.entity';
import { WithStringEntity } from '../../../common/model/with/with-string.entity';
import { Document2flagEntity } from './document2flag.entity';
import { Document4stringEntity } from './document4string.entity';
import { InstanceEntity } from '../instance/instance.entity';

@Entity('bundle-bundle')
export class DocumentEntity
  extends BaseEntity
  implements WithFlagEntity<DocumentEntity>, WithStringEntity<DocumentEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @OneToMany(
    type => InstanceEntity,
    entity => entity.document,
  )
  instance: Array<InstanceEntity>;

  @OneToMany(
    type => Document4stringEntity,
    string => string.parent,
  )
  string: Document4stringEntity[];

  @OneToMany(
    type => Document2flagEntity,
    flag => flag.parent,
  )
  flag: Document2flagEntity[];

}