import { AttributeValueInput } from './attribute-value.input';

export class AttributeElementInput
  implements AttributeValueInput {

  attribute: string;
  element: string;

}