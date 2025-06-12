import { StringAttributeValue } from '../common/string-attribute-value';

export interface LangEntity {

  id: string;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
