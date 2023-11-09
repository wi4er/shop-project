import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';

export class PointInput implements WithPropertyInput, WithFlagInput {

  id: string;

  directory: string;

  property: PropertyValueInput[];

  flag: string[];

}