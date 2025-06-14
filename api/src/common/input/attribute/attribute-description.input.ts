import { AttributeValueInput } from './attribute-value.input';

export interface AttributeDescriptionInput
  extends AttributeValueInput {

  attribute: string;
  description: string;
  lang?: string;

}