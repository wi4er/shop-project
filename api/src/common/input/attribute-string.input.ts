import { AttributeValueInput } from './attribute-value.input';

export interface AttributeStringInput
  extends AttributeValueInput {

  attribute: string;
  string: string;
  lang?: string;

}