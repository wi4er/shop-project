import { StringPropertyValue } from '../string-property-value';

export interface BlockInput {
  id?: number;
  flag: string[];
  property: StringPropertyValue[];
}
