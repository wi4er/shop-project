import { StringAttributeValue } from './string-attribute-value';

export interface Document {

  id: number;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
