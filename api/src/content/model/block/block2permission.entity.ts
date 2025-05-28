import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { GroupEntity } from '../../../personal/model/group/group.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { CommonPermissionEntity } from '../../../common/model/common-permission.entity';

@Entity('content-block2permission')
@Index(['parent', 'group', 'method'], {unique: true})
export class Block2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<BlockEntity> {

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
    type => BlockEntity,
    block => block.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    },
  )
  parent: BlockEntity;

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