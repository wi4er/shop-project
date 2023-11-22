import { StringPropertyValue } from '../string-property-value';

export interface UserInput {
  id?: number;
  login: string;
  flag: string[];
  property: StringPropertyValue[];
}
