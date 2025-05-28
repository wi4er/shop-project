import { BaseEntity } from 'typeorm';
import { GroupEntity } from '../../personal/model/group/group.entity';
import { PermissionMethod } from '../../permission/model/permission-method';

export interface CommonPermissionEntity<T extends BaseEntity>
  extends BaseEntity{

  parent: T;

  group: GroupEntity;
  method: PermissionMethod;

}