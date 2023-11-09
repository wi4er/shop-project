import { UserUserContactInput } from './user-user-contact.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class UserInput implements WithPropertyInput, WithFlagInput {

  id: number;

  created_at: string;

  updated_at: string;

  version: number;

  login: string;

  hash?: string;

  contact: UserUserContactInput[];

  group?: number[];

  property: PropertyValueInput[];

  flag: string[];

}