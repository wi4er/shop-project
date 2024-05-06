import { StringPropertyValue } from '../string-property-value';

interface PermissionInput {

  method: string;
  group: number;

}

export interface ElementInput {

  id: string;
  block: number;
  image: Array<number>;
  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionInput[];

}
