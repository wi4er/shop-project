import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class ElementInput implements WithPropertyInput, WithFlagInput {

  block: number;

  property: PropertyValueInput[];
  flag: string[];

  permission: PermissionValueInput[];

}