import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface DocumentEntity {

  id: string;
  created_at: string;
  updated_at: string;

  flag: Array<string>;
  attribute: Array<CommonAttributeValue>;
  field: Array<string>;

}
