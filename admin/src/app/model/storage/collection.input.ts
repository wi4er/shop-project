import { CommonAttributeValue } from '../common/common-attribute-value';

export interface CollectionInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
