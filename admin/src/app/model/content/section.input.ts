import { PermissionInput } from '../permission/permission-input';
import { WithAttributeInput } from '../settings/with-attribute.input';
import { CommonAttributeValue } from '../common/common-attribute-value';

export interface SectionInput
  extends WithAttributeInput {

  id: string;
  block: number;

  image: Array<number>;
  flag: string[];
  attribute: Array<CommonAttributeValue>;
  permission: PermissionInput[];

}
