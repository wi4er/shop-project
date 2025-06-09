import { StringAttributeValue } from '../string-attribute-value';
import { PermissionValue } from '../permission/permission-value';

export interface BlockEntity {

  id: string;
  created_at: string;
  updated_at: string;
  sort: number;

  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionValue[];

}
