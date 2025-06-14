import { AttributeValueInput } from './attribute-value.input';

export class AttributeSectionInput
  implements AttributeValueInput {

  attribute: string;
  section: string;

}