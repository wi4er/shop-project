import { StringPropertyValue } from '../string-property-value';

export interface FormInput {
  id?: string;
  flag: string[];
  property: StringPropertyValue[];
}
