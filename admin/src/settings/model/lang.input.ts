import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface LangInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
