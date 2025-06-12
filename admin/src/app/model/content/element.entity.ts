import { PermissionValue } from '../permission/permission-value';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface ElementEntity {

  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  sort: number;
  image: Array<{
    original: string;
    image: number;
    path: string;
    collection: string;
  }>
  flag: string[];
  attribute: Array<CommonAttributeValue>;
  permission: PermissionValue[];

}
