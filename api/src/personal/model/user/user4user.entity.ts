import {
  BaseEntity,
  CreateDateColumn, DeleteDateColumn,
  Entity, Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

@Entity('personal-user4user')
@Index(['user', 'parent', 'attribute'], {unique: true})
export class User4userEntity extends BaseEntity {

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

  @ManyToOne(
    () => UserEntity,
    user => user.string,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  parent: UserEntity;

  @ManyToOne(
    () => UserEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  user: UserEntity;

  @ManyToOne(
    () => AttributeEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  attribute: AttributeEntity;

}