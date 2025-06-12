import { CommonAttributeValue } from '../common/common-attribute-value';

export interface LangInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
