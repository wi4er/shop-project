import { PropertyValueInput } from '../../common/input/property-value.input';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { WithPermissionInput } from '../../common/input/with-permission.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class SectionInput
  implements WithPropertyInput, WithFlagInput, WithPermissionInput {

  id: string;
  block: number;
  sort: number;
  parent?: string;

  image: Array<number>;
  property: PropertyValueInput[];
  permission: PermissionValueInput[];
  flag: string[];

}