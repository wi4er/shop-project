import { StringPropertyValue } from '../string-property-value';

export interface PropertyInput {
  id?: string;
  flag: string[];
  property: StringPropertyValue[];
}
