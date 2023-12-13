import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn, Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';
import { PropertyEntity } from '../../settings/model/property.entity';

@Entity('personal-user4group')
export class User4groupEntity extends BaseEntity {

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
    type => GroupEntity,
    group => group.user,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  group: GroupEntity;

  @ManyToOne(
    type => UserEntity,
    user => user.group,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  parent: UserEntity;

  @ManyToOne(
    () => PropertyEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  property: PropertyEntity;

}