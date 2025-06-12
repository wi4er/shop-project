import { PermissionValue } from '../permission/permission-value';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface SectionEntity {

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
  attribute: Array<CommonAttributeValue>;
  permission: PermissionValue[];

}
