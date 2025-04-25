import { StringAttributeValue } from '../string-attribute-value';
import { WithAttributeInput } from '../settings/with-attribute.input';
import { PermissionInput } from '../permission/permission-input';

export interface ElementInput
  extends WithAttributeInput {

  id: string;
  block: number;

  image: Array<number>;
  flag: string[];
  attribute: StringAttributeValue[];
  permission: PermissionInput[];

}
