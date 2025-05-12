import { BaseEntity } from 'typeorm';
import { GroupEntity } from '../../personal/model/group/group.entity';
import { PermissionOperation } from '../../permission/model/permission-operation';

export interface CommonPermissionEntity<T extends BaseEntity>
  extends BaseEntity{

  parent: T;

  group: GroupEntity;
  method: PermissionOperation;

}