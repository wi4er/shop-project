import { PermissionInput } from '../permission/permission-input';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface DirectoryInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;
  permission: PermissionInput[];

}
