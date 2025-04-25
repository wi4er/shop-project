import { StringAttributeValue } from '../string-attribute-value';
import { PermissionValue } from '../permission/permission-value';

export interface Section {

  id: string;
  created_at: string;
  updated_at: string;
  sort: number;

  image: Array<{
    original: string;
    image: number;
    path: string;
    collection: string;
  }>
  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionValue[];

}
