import { PermissionValue } from '../permission/permission-value';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface BlockEntity {

  id: string;
  created_at: string;
  updated_at: string;
  sort: number;

  flag: string[];
  attribute: Array<CommonAttributeValue>;
  permission: PermissionValue[];

}
