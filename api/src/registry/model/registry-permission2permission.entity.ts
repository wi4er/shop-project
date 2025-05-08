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
import { GroupEntity } from '../../personal/model/group.entity';
import { PermissionOperation } from '../../permission/model/permission-operation';
import { CommonPermissionEntity } from '../../common/model/common-permission.entity';
import { RegistryPermissionEntity } from './registry-permission.entity';

@Entity('registry-permission2permission')
export class RegistryPermission2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<RegistryPermissionEntity> {

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
    type => RegistryPermissionEntity,
    directory => directory.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: RegistryPermissionEntity;

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