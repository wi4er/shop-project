import { BaseEntity } from 'typeorm';
import { UserGroupEntity } from '../../user/model/user-group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

export class CommonPermissionEntity<T> extends BaseEntity {

  parent: T;
  group: UserGroupEntity;
  method: PermissionMethod;

}