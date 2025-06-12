import { StringAttributeValue } from '../common/string-attribute-value';

export interface ContactEntity {

  id: string;
  created_at: string;
  updated_at: string;
  type: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
