import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';

export class SectionInput implements WithPropertyInput, WithFlagInput {

  id: string;
  block: number;

  parent?: string;
  image: Array<number>;

  property: PropertyValueInput[];

  flag: string[];

}