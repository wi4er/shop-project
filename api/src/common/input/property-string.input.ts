import { PropertyValueInput } from './property-value.input';

export interface PropertyStringInput extends PropertyValueInput {

  property: string;
  string: string;
  lang?: string;

}