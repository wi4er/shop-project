import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { GroupEntity } from '../../personal/model/group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';
import { ElementEntity } from './element.entity';
import { CommonPermissionEntity } from '../../common/model/common-permission.entity';

@Entity('content-element2permission')
export class Element2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<ElementEntity>
{

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
      nullable: false,
    }
  )
  parent: ElementEntity;

  @ManyToOne(
    type => GroupEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    }
  )
  group: GroupEntity;

  @Column({
    type: 'enum',
    enum: PermissionMethod,
    nullable: false,
  })
  method: PermissionMethod;

}