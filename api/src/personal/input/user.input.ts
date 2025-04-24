import { User2userContactInput } from './user2user-contact.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute-value.input';

export class UserInput implements WithAttributeInput, WithFlagInput {

  id: string;
  login: string;
  contact: User2userContactInput[];
  group?: string[];
  attribute: AttributeValueInput[];
  flag: string[];

}