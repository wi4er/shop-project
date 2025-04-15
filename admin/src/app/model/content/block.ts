import { StringPropertyValue } from '../string-property-value';
import { PermissionValue } from '../permission/permission-value';

export interface Block {

  id: number;
  created_at: string;
  updated_at: string;

  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionValue[];

}
