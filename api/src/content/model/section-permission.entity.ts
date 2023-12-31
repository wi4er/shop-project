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
import { SectionEntity } from './section.entity';

@Entity('section-permission')
export class SectionPermissionEntity extends BaseEntity {

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
      cascade: true,
      nullable: false,
    }
  )
  section: SectionEntity;

  @ManyToOne(
    type => GroupEntity,
    {
      cascade: true,
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