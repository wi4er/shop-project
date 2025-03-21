import { StringPropertyValue } from '../string-property-value';

export interface SectionInput {

  id: string;
  block: number;
  image: Array<number>;
  flag: string[];
  property: StringPropertyValue[];

}
