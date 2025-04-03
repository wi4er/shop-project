import { StringPropertyValue } from '../string-property-value';
import { WithPropertyInput } from '../settings/with-property.input';

interface PermissionInput {

  method: string;
  group?: string;

}

export interface ElementInput extends WithPropertyInput {

  id: string;
  block: number;
  image: Array<number>;
  flag: string[];
  property: StringPropertyValue[];
  permission: PermissionInput[];

}
