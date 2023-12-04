import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class DocumentInput implements WithPropertyInput, WithFlagInput {

  property: PropertyValueInput[];
  flag: string[];

}