import { WithAttributeInput } from '../settings/with-attribute.input';
import { PermissionInput } from '../permission/permission-input';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface ElementInput
  extends WithAttributeInput {

  id: string;
  block: number;

  image: Array<number>;
  flag: string[];
  attribute: Array<CommonAttributeValue>;
  permission: PermissionInput[];

}
