import { StringPropertyValue } from '../string-property-value';

export interface Element {
  id: number;
  created_at: string;
  updated_at: string;
  version: number;
  image: Array<{
    original: string;
    image: number;
    path: string;
    collection: string;
  }>
  flag: string[];
  property: StringPropertyValue[];
}
