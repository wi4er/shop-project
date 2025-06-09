import { StringAttributeValue } from '../string-attribute-value';
import { AttributeType } from '../../../settings/attribute-form/attribute-form.component';

export interface Attribute {

  id: string;
  created_at: string;
  updated_at: string;
  type: AttributeType;

  block: string | null;
  directory: string | null;
  collection: string | null;

  flag: string[];
  attribute: StringAttributeValue[];

}
