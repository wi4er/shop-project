import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface FieldInput {

  id?: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
