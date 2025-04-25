import { StringAttributeValue } from '../string-attribute-value';
import { PermissionInput } from '../permission/permission-input';

export interface SectionInput {

  id: string;
  block: number;

  image: Array<number>;
  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionInput[];

}
