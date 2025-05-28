import { AttributeValueInput } from '../../common/input/attribute-value.input';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { WithPermissionInput } from '../../common/input/with-permission.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class SectionInput
  implements WithAttributeInput, WithFlagInput, WithPermissionInput {

  id: string;
  block: string;
  sort: number;
  parent?: string;

  image: Array<number>;
  attribute: AttributeValueInput[];
  permission: PermissionValueInput[];
  flag: string[];

}