import { BaseEntity } from 'typeorm';
import { CommonPermissionEntity } from '../common/common-permission.entity';

export abstract class WithPermissionEntity<T extends BaseEntity>
  extends BaseEntity {

  permission: CommonPermissionEntity<T>[];

}