import { User2userContactInput } from './user2user-contact.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class UserInput implements WithPropertyInput, WithFlagInput {

  id: number;
  login: string;
  contact: User2userContactInput[];
  group?: number[];
  property: PropertyValueInput[];
  flag: string[];

}