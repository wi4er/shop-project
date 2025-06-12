import { CommonAttributeValue } from '../common/common-attribute-value';

export interface ContactInput {

  id?: string;
  type: string;
  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
