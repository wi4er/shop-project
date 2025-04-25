import { StringAttributeValue } from '../string-attribute-value';

export interface ContactInput {

  id?: string;
  type: string;
  flag: string[];
  attribute: StringAttributeValue[];

}
