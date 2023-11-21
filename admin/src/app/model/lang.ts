import { StringPropertyValue } from './string-property-value';

export interface Lang {
  id: string;
  created_at: string;
  updated_at: string;
  flag: string[];
  property: StringPropertyValue[];
}
