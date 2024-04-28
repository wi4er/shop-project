import { StringPropertyValue } from '../string-property-value';

export interface File {

  id: number;
  created_at: string;
  updated_at: string;
  version: number;

  path: string;
  mimetype: string;
  original: string;
  collection: string;
  flag: string[];
  property: StringPropertyValue[];

}
