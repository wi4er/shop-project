import { StringPropertyValue } from './string-property-value';

export interface Directory {
  id: number;
  created_at: string;
  updated_at: string;
  flag: string[];
  property: StringPropertyValue[];
}
