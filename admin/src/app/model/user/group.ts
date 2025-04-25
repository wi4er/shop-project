import { StringAttributeValue } from '../string-attribute-value';

export interface Group {

  id: string;
  created_at: string;
  updated_at: string;
  parent: number;

  flag: string[];
  attribute: StringAttributeValue[];

}
