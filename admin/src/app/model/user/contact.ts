import { StringPropertyValue } from '../string-property-value';

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  type: string;
  flag: string[];
  property: StringPropertyValue[];
}
