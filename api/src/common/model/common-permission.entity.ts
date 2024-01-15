import { BaseEntity } from 'typeorm';
import { GroupEntity } from '../../personal/model/group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

export interface CommonPermissionEntity<T> {

  parent: T;
  group: GroupEntity;
  method: PermissionMethod;

}