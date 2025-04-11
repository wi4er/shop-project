import { StringProperty } from './StringProperty';

export interface ContentBlock {

  id: number;
  created_at: string;
  updated_at: string;
  version: number;
  sort: number;
  property: Array<StringProperty>;

}
