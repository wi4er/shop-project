import { CommonAttributeValue } from './common/common-attribute-value';

export interface DocumentInput {

  id?: number;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
