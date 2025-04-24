import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class FlagInput implements WithPropertyInput, WithFlagInput {

  id: string;
  icon: string;
  iconSvg: string;
  color: string;

  property: PropertyValueInput[];
  flag: string[];

}