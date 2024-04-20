import { StringPropertyValue } from '../string-property-value';

export interface Collection {

  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  flag: string[];
  property: StringPropertyValue[];

}
