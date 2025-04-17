import { PermissionMethod } from './permission-method';


export interface PermissionValue {

  method: PermissionMethod;
  group?: string | null;

}
