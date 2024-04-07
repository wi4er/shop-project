import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class FileInput  implements WithPropertyInput, WithFlagInput {

  id?: number;
  collection: string;
  property: PropertyValueInput[];
  flag: string[];

}