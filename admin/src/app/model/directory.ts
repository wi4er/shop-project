import { StringAttributeValue } from './string-attribute-value';
import { PermissionValue } from './permission/permission-value';

export interface Directory {

  id: string;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionValue[];

}
