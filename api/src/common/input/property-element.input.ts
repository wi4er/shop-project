import { AttributeValueInput } from './attribute-value.input';

export class PropertyElementInput
  implements AttributeValueInput {

  attribute: string;
  element: string;

}