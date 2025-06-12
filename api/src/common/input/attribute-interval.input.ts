import { AttributeValueInput } from './attribute-value.input';

export interface AttributeIntervalInput
  extends AttributeValueInput {

  attribute: string;
  from: string;
  to: string;

}