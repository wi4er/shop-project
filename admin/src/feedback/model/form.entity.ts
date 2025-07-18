import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface FormEntity {

  id: string;
  created_at: string;
  updated_at: string;
  version: number;

  flag: Array<string>;
  attribute: Array<CommonAttributeValue>;
  field: Array<string>

}
