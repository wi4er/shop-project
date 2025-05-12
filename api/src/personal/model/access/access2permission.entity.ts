import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { GroupEntity } from '../group/group.entity';
import { PermissionOperation } from '../../../permission/model/permission-operation';
import { CommonPermissionEntity } from '../../../common/model/common-permission.entity';
import { AccessEntity } from './access.entity';

@Entity('personal-access2permission')
export class Access2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<AccessEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @VersionColumn()
  version: number;

  @ManyToOne(
    type => AccessEntity,
    directory => directory.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: AccessEntity;

  @ManyToOne(
    type => GroupEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  group: GroupEntity;

  @Column({
    type: 'enum',
    enum: PermissionOperation,
    nullable: false,
  })
  method: PermissionOperation;

}