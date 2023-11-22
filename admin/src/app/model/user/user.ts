import { StringPropertyValue } from '../string-property-value';

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  login: string;
  flag: string[];
  property: StringPropertyValue[];
}
