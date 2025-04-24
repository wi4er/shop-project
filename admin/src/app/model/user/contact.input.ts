import { StringPropertyValue } from '../string-property-value';

export interface ContactInput {

  id?: string;
  type: string;
  flag: string[];
  property: StringPropertyValue[];

}
