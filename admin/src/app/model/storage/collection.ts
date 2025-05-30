import { StringAttributeValue } from '../string-attribute-value';

export interface Collection {

  id: string;
  created_at: string;
  updated_at: string;
  version: number;

  flag: string[];
  attribute: StringAttributeValue[];

}
