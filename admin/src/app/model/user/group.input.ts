import { StringPropertyValue } from '../string-property-value';

export interface GroupInput {
  id?: number;
  flag: string[];
  property: StringPropertyValue[];
}
