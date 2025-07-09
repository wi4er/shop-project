import { AttributeType } from '../attribute-form/attribute-form.component';
import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface AttributeEntity {

  id: string;
  created_at: string;
  updated_at: string;
  type: AttributeType;

  block: string | null;
  directory: string | null;
  collection: string | null;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
