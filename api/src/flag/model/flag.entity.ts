import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn, VersionColumn
} from "typeorm";
import { Flag2stringEntity } from "./flag2string.entity";
import { Flag2flagEntity } from "./flag2flag.entity";

@Entity('flag')
export class FlagEntity extends BaseEntity {

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

  @Column({
    nullable: true,
  })
  label: string;

  @OneToMany(
    type => Flag2stringEntity,
    property => property.parent,
  )
  string: Flag2stringEntity[];

  @OneToMany(
    type => Flag2flagEntity,
    flag => flag.parent,
  )
  flag: Flag2flagEntity[];

}