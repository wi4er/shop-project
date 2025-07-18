import {
  BaseEntity, Column,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ContactEntity } from "../contact/contact.entity";
import { UserEntity } from "./user.entity";

@Entity('personal-user2contact')
@Index([ 'contact', 'value' ], { unique: true })
export class User2contactEntity
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(
    type => ContactEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  contact: ContactEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.contact,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
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