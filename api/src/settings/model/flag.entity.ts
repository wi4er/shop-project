import {
  BaseEntity, Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Flag4stringEntity } from "./flag4string.entity";
import { Flag2flagEntity } from "./flag2flag.entity";
import { WithStringEntity } from '../../common/model/with/with-string.entity';
import { WithFlagEntity } from '../../common/model/with/with-flag.entity';

@Entity('settings-flag')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class FlagEntity
  extends BaseEntity
  implements WithStringEntity<FlagEntity>, WithFlagEntity<FlagEntity> {

  @PrimaryColumn({
    type: "varchar",
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

  @Column()
  sort: number = 100;

  @Column({
    nullable: true,
  })
  icon: string;

  @Column({
    nullable: true,
  })
  iconSvg: string;

  @Column({
    nullable: true,
    length: 9,
  })
  color: string;

  @OneToMany(
    type => Flag4stringEntity,
    attribute => attribute.parent,
  )
  string: Flag4stringEntity[];

  @OneToMany(
    type => Flag2flagEntity,
    flag => flag.parent,
  )
  flag: Flag2flagEntity[];

}