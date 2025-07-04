import { StringAttributeValue } from '../common/string-attribute-value';

export interface UserEntity {

  id: string;
  created_at: string;
  updated_at: string;
  login: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
