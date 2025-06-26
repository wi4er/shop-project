import { StringAttributeValue } from '../common/string-attribute-value';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface LangEntity {

  id: string;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
