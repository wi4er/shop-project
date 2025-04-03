import { StringPropertyValue } from '../string-property-value';

export interface Group {

  id: string;
  created_at: string;
  updated_at: string;
  parent: number;
  flag: string[];
  property: StringPropertyValue[];

}
