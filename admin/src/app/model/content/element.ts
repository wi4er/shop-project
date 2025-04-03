import { StringPropertyValue } from '../string-property-value';
import { PermissionValue } from '../permission/permission-value';

export interface Element {

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
  property: StringPropertyValue[];
  permission: PermissionValue[];

}
