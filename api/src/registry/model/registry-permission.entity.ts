import {
  BaseEntity, Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { RegistryPermission2permissionEntity } from './registry-permission2permission.entity';


export enum PermissionMethod {

  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',

}

export enum RegistryEntity {

  DIRECTORY = 'DIRECTORY',
  POINT = 'POINT',

}

@Entity('registry-registry-permission')
export class RegistryPermissionEntity extends BaseEntity {

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

  @Column({
    type: 'enum',
    enum: RegistryEntity,
    nullable: false,
  })
  entity: RegistryEntity;

  @Column({
    type: 'enum',
    enum: PermissionMethod,
    nullable: false,
  })
  method: PermissionMethod;

  @OneToMany(
    type => RegistryPermission2permissionEntity,
    permission => permission.parent,
  )
  permission: RegistryPermission2permissionEntity[];

}