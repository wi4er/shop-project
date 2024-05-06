import { StringPropertyValue } from '../string-property-value';

export interface Section {
  id: string;
  created_at: string;
  updated_at: string;
  image: Array<{
    original: string;
    image: number;
    path: string;
    collection: string;
  }>
  flag: string[];
  property: StringPropertyValue[];
}
