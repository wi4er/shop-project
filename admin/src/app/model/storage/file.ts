import { StringPropertyValue } from '../string-property-value';

export interface File {

  id: number;
  created_at: string;
  updated_at: string;
  version: number;
  flag: string[];
  property: StringPropertyValue[];

}
