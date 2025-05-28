import { AttributeValueInput } from '../../common/input/attribute-value.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';
import { WithPermissionInput } from '../../common/input/with-permission.input';

export class ElementInput
  implements WithAttributeInput, WithFlagInput, WithPermissionInput {

  id: string;
  block: string;
  sort: number;

  image: Array<number>;
  attribute: AttributeValueInput[];
  flag: string[];

  permission: PermissionValueInput[];

}