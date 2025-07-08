import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute/attribute-value.input';
import { WithFieldInput } from '../../common/input/with-field.input';

export class DocumentInput
  implements WithAttributeInput, WithFlagInput, WithFieldInput {

  id: string;

  attribute: AttributeValueInput[];
  flag: string[];
  field: string[];

}