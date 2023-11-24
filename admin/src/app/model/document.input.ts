import { StringPropertyValue } from './string-property-value';

export interface DocumentInput {
  id?: number;
  flag: string[];
  property: StringPropertyValue[];
}
