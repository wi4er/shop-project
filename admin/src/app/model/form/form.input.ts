import { CommonAttributeValue } from '../common/common-attribute-value';

export interface FormInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
