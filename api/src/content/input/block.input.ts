import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { WithPermissionInput } from '../../common/input/with-permission.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class BlockInput
  implements WithPropertyInput, WithFlagInput, WithPermissionInput {

  property: PropertyValueInput[];
  flag: string[];

  permission: PermissionValueInput[];

}