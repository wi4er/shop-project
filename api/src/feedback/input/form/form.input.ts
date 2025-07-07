import { WithAttributeInput } from '../../../common/input/with-attribute.input';
import { WithFlagInput } from '../../../common/input/with-flag.input';
import { AttributeValueInput } from '../../../common/input/attribute/attribute-value.input';

export class FormInput implements WithAttributeInput, WithFlagInput {

  id: string;
  attribute: AttributeValueInput[];
  flag: string[];

}