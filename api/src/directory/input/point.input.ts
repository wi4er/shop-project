import { AttributeValueInput } from '../../common/input/attribute-value.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';

export class PointInput implements WithAttributeInput, WithFlagInput {

  id: string;

  directory: string;

  attribute: AttributeValueInput[];

  flag: string[];

}