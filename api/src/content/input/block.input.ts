import { AttributeValueInput } from '../../common/input/attribute-value.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { WithPermissionInput } from '../../common/input/with-permission.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class BlockInput
  implements WithAttributeInput, WithFlagInput, WithPermissionInput {

  sort: number;

  attribute: AttributeValueInput[];
  flag: string[];
  permission: PermissionValueInput[];

}