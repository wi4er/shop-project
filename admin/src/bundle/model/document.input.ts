import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface DocumentInput {

  id?: string;

  flag: Array<string>;
  attribute: Array<CommonAttributeValue>;
  field: Array<string>;

}
