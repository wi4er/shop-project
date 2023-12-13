import { BaseEntity } from 'typeorm';
import { GroupEntity } from '../../personal/model/group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

export class CommonPermissionEntity<T> extends BaseEntity {

  parent: T;
  group: GroupEntity;
  method: PermissionMethod;

}