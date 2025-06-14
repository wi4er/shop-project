import { AttributeValueInput } from '../../../common/input/attribute/attribute-value.input';
import { WithAttributeInput } from '../../../common/input/with-attribute.input';
import { WithFlagInput } from '../../../common/input/with-flag.input';

export class AttributeInput
  implements WithAttributeInput, WithFlagInput {

  id: string;
  type: string;

  directory: string | null;
  block: string | null;
  collection: string | null;

  attribute: AttributeValueInput[];
  flag: string[];

}