import {
  BaseEntity, Column,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonPermissionEntity } from '../../../common/model/common/common-permission.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { DirectoryEntity } from './directory.entity';

@Entity('registry-directory2permission')
@Index(['parent', 'group', 'method'], {unique: true, where: '"groupId" IS NOT NULL'})
@Index(['parent', 'method'], {unique: true, where: '"groupId" IS NULL'})
export class Directory2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<DirectoryEntity> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DirectoryEntity,
    directory => directory.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: DirectoryEntity;

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
    enum: PermissionMethod,
    nullable: false,
  })
  method: PermissionMethod;

}