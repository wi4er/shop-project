import {
  BaseEntity, Check, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany, PrimaryColumn,
  UpdateDateColumn, VersionColumn
} from "typeorm";
import { UserContact2flagEntity } from "./user-contact2flag.entity";
import { UserContact4stringEntity } from "./user-contact4string.entity";
import { WithFlagEntity } from '../../common/model/with-flag.entity';
import { WithStringEntity } from '../../common/model/with-string.entity';

export enum UserContactType {

  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',

}

@Entity('user-contact')
@Check('not_empty_id', '"id" > \'\'')
export class UserContactEntity
  extends BaseEntity
  implements WithFlagEntity<UserContactEntity>, WithStringEntity<UserContactEntity> {

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
    type: 'enum',
    enum: UserContactType,
    nullable: false,
  })
  type: UserContactType;

  @OneToMany(
    type => UserContact4stringEntity,
    property => property.parent,
  )
  string: UserContact4stringEntity[];

  @OneToMany(
    type => UserContact2flagEntity,
    flag => flag.parent,
  )
  flag: UserContact2flagEntity[];

}