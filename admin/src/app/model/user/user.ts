import { StringAttributeValue } from '../string-attribute-value';

export interface User {

  id: string;
  created_at: string;
  updated_at: string;
  login: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
