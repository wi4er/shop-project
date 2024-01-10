import { StringPropertyValue } from '../string-property-value';

export interface Group {
  id: number;
  created_at: string;
  updated_at: string;
  parent: number;
  flag: string[];
  property: StringPropertyValue[];
}
