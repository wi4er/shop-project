import { AttributeValueInput } from './attribute-value.input';

export class AttributeCounterInput
  implements AttributeValueInput {

  attribute: string;
  counter: string;
  count: number;
  
}