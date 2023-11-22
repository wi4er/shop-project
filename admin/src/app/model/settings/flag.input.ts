import { StringPropertyValue } from '../string-property-value';

export interface FlagInput {
  id?: string;
  flag: string[];
  property: StringPropertyValue[];
}
