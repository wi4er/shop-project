import { UserPropertySchema } from './user-property.schema';
import { UserUserContactSchema } from './user-user-contact.schema';

export class UserSchema {

  id: number;

  created_at: string;

  updated_at: string;

  version: number;

  login: string;

  hash?: string;

  contact: UserUserContactSchema[];

  group?: string[];

  property: UserPropertySchema[];

  flag: string[];

}