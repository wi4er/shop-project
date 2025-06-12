import { CommonAttributeValue } from '../common/common-attribute-value';

export interface UserInput {

  id?: number;
  login: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
