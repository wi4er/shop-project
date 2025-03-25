import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Contact2flagEntity } from "./contact2flag.entity";
import { Contact4stringEntity } from "./contact4string.entity";
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';

export enum UserContactType {

  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',

}

@Entity('personal-contact')
@Check('not_empty_id', '"id" > \'\'')
@Index(['sort'])
export class ContactEntity
  extends BaseEntity
  implements WithFlagEntity<ContactEntity>, WithStringEntity<ContactEntity> {

  @PrimaryColumn({
    type: "varchar",
    length: 50,
    nullable: false,
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
    type: 'enum',
    enum: UserContactType,
    nullable: false,
  })
  type: UserContactType;

  @Column()
  sort: number = 100;

  @OneToMany(
    type => Contact4stringEntity,
    property => property.parent,
  )
  string: Contact4stringEntity[];

  @OneToMany(
    type => Contact2flagEntity,
    flag => flag.parent,
  )
  flag: Contact2flagEntity[];

}