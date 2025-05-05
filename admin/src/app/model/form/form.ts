import { StringAttributeValue } from '../string-attribute-value';

export interface Form {

  id: string;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
