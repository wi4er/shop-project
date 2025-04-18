import { StringPropertyValue } from '../string-property-value';
import { PermissionInput } from '../permission/permission-input';

export interface SectionInput {

  id: string;
  block: number;

  image: Array<number>;
  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionInput[];
}
