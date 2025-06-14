import { AttributeValueInput } from '../../../common/input/attribute/attribute-value.input';
import { WithAttributeInput } from '../../../common/input/with-attribute.input';
import { WithFlagInput } from '../../../common/input/with-flag.input';
import { WithPermissionInput } from '../../../common/input/with-permission.input';
import { PermissionValueInput } from '../../../common/input/permission-value.input';

export class DirectoryInput
  implements WithAttributeInput, WithFlagInput, WithPermissionInput {

  id: string;

  attribute: AttributeValueInput[];
  flag: string[];
  permission: PermissionValueInput[];

}