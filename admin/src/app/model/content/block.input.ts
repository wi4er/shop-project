import { PermissionInput } from '../permission/permission-input';
import { CommonAttributeValue } from '../common/common-attribute-value';
import { WithAttributeInput } from '../settings/with-attribute.input';

export interface BlockInput
  extends WithAttributeInput {

  id?: string;
  sort: number;

  flag: string[];
  attribute: CommonAttributeValue[];
  permission: PermissionInput[];

}
