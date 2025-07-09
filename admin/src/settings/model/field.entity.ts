import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface FieldEntity {

  id: string;
  created_at: string;
  updated_at: string;

  block: string | null;
  directory: string | null;
  collection: string | null;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
