import { PermissionOperation } from '../../permission/model/permission-operation';

export interface PermissionValueInput {

  group: string;
  method: PermissionOperation;

}