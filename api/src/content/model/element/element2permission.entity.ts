import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { ElementEntity } from './element.entity';
import { CommonPermissionEntity } from '../../../common/model/common-permission.entity';

@Entity('content-element2permission')
@Index(['parent', 'group', 'method'], {unique: true, where: '"groupId" IS NOT NULL'})
@Index(['parent', 'method'], {unique: true, where: '"groupId" IS NULL'})
export class Element2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<ElementEntity> {

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
    type => ElementEntity,
    element => element.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: ElementEntity;

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