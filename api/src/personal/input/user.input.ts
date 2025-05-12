import { User2contactInput } from './user2contact.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute-value.input';

export class UserInput implements WithAttributeInput, WithFlagInput {

  id: string;
  login: string;
  contact: User2contactInput[];
  group?: string[];
  attribute: AttributeValueInput[];
  flag: string[];

}