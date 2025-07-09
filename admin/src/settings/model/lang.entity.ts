import { StringAttributeValue } from '../../app/model/common/string-attribute-value';
import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface LangEntity {

  id: string;
  created_at: string;
  updated_at: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
