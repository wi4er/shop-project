import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';

export class BlockInput implements WithPropertyInput, WithFlagInput {

  property: PropertyValueInput[];
  flag: string[];

}