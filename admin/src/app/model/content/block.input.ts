import { StringAttributeValue } from '../string-attribute-value';
import { PermissionInput } from '../permission/permission-input';

export interface BlockInput {

  id?: string;
  sort: number;

  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionInput[];

}
