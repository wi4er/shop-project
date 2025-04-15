import { StringPropertyValue } from '../string-property-value';
import { PermissionInput } from '../permission/permission-input';

export interface BlockInput {

  id?: number;
  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionInput[];

}
