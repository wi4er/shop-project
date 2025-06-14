import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute/attribute-value.input';

export class DocumentInput implements WithAttributeInput, WithFlagInput {

  attribute: AttributeValueInput[];
  flag: string[];

}