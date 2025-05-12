import { WithPermissionInput } from '../../common/input/with-permission.input';
import { PermissionValueInput } from '../../common/input/permission-value.input';

export class AccessInput
  implements WithPermissionInput {

  id: number;
  directory: string;

  permission: PermissionValueInput[];

}