import { AttributeValueInput } from '../../common/input/attribute-value.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';

export class DirectoryInput implements WithAttributeInput, WithFlagInput {

  id: string;

  attribute: AttributeValueInput[];

  flag: string[];

}