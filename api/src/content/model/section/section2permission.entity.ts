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
import { SectionEntity } from './section.entity';
import { CommonPermissionEntity } from '../../../common/model/common-permission.entity';

@Entity('content-section2permission')
@Index(['parent', 'group', 'method'], {unique: true})
export class Section2permissionEntity
  extends BaseEntity
  implements CommonPermissionEntity<SectionEntity> {

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
    type => SectionEntity,
    section => section.permission,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: false,
    }
  )
  parent: SectionEntity;

  @ManyToOne(
    type => GroupEntity,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      nullable: true,
    }
  )
  group: GroupEntity | null;

  @Column({
    type: 'enum',
    enum: PermissionMethod,
    nullable: false,
  })
  method: PermissionMethod;

}