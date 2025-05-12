import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupEntity } from '../../personal/model/group/group.entity';

export enum SettingsEntity {

  PROPERTY = 'PROPERTY',
  FLAG = 'FLAG',
  LANG = 'LANG',
  CONFIG = 'CONFIG',
  SETTINGS = 'SETTINGS',

}

export enum SettingsMethod {

  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  ALL = 'ALL',

}

@Entity('settings-access')
export class SettingsPermissionEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({
    type: 'enum',
    enum: SettingsEntity,
    nullable: false,
  })
  type: SettingsEntity;

  @Column({
    type: 'enum',
    enum: SettingsMethod,
    nullable: false,
  })
  method: SettingsMethod;

  @ManyToOne(
    type => GroupEntity,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  group: GroupEntity;

}