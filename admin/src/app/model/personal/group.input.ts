import { CommonAttributeValue } from '../common/common-attribute-value';

export interface GroupInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
