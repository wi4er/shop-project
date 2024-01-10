import { StringPropertyValue } from '../string-property-value';

interface PermissionInput {
  method: string;
  group: number;
}

export interface ElementInput {
  block: number;
  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionInput[];
}
