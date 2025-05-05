import { StringAttributeValue } from '../string-attribute-value';
import { PermissionInput } from '../permission/permission-input';

export interface DirectoryInput {

  id?: string;

  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionInput[];

}
