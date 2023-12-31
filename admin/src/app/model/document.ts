import { StringPropertyValue } from './string-property-value';

export interface Document {
  id: number;
  created_at: string;
  updated_at: string;
  flag: string[];
  property: StringPropertyValue[];
}
