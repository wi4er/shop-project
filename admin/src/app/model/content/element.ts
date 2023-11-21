import { StringPropertyValue } from '../string-property-value';

export interface Element {
  id: number;
  created_at: string;
  updated_at: string;
  flag: string[];
  property: StringPropertyValue[];
}
