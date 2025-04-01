import { StringProperty } from './StringProperty';

export interface ContentElement {

  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  sort: number;
  property: Array<StringProperty>;

}
