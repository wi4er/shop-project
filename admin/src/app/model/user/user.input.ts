import { StringAttributeValue } from '../string-attribute-value';

export interface UserInput {

  id?: number;
  login: string;

  flag: string[];
  attribute: StringAttributeValue[];

}
