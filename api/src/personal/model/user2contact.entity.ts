import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn
} from "typeorm";
import { ContactEntity } from "./contact.entity";
import { UserEntity } from "./user.entity";

@Entity('personal-user2contact')
@Index([ 'contact', 'value' ], { unique: true })
export class User2contactEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @VersionColumn()
  version: number;

  @Column()
  value: string;

  @ManyToOne(
    type => ContactEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  contact: ContactEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.contact,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  parent: UserEntity;

  @Column({
    type: Boolean,
    default: false,
  })
  verify: boolean;

  @Column()
  verifyCode: string;

}