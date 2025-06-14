import { WithAttributeInput } from '../../../common/input/with-attribute.input';
import { WithFlagInput } from '../../../common/input/with-flag.input';
import { AttributeValueInput } from '../../../common/input/attribute/attribute-value.input';

export class FlagInput implements WithAttributeInput, WithFlagInput {

  id: string;
  icon: string;
  iconSvg: string;
  color: string;

  attribute: AttributeValueInput[];
  flag: string[];

}