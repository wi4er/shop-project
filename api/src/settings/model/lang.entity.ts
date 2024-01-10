import {
  BaseEntity, Check,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Lang4stringEntity } from './lang4string.entity';
import { Lang2flagEntity } from './lang2flag.entity';

@Entity('settings-lang')
@Check('not_empty_id', '"id" > \'\'')
export class LangEntity extends BaseEntity {

  @PrimaryColumn({
    type: 'varchar',
    length: 50,
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
    type => Lang4stringEntity,
    string => string.parent,
  )
  string: Lang4stringEntity[];

  @OneToMany(
    type => Lang2flagEntity,
    flag => flag.parent,
  )
  flag: Lang2flagEntity[];

}